// Custom event for OPFS changes
export const OPFS_CHANGE_EVENT = "opfs-change";

export interface OpfsChangeDetail {
  type: "file-added" | "file-deleted" | "directory-added" | "directory-deleted";
  path: string;
}

export class OpfsStorage {
  private static rootDir: FileSystemDirectoryHandle | null = null;
  private static context: "worker" | "window" | "unknown" = "unknown";
  private static initPromise: Promise<void> | null = null;

  /**
   * Emit a custom event when OPFS changes
   */
  private static emitChange(detail: OpfsChangeDetail): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(OPFS_CHANGE_EVENT, { detail }));
    }
  }

  private static _getExecutionContext(): "worker" | "window" | "unknown" {
    if (
      typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope
    ) {
      return "worker";
    }

    if (typeof window !== "undefined") return "window";

    return "unknown";
  }

  private static async _ensureInit(): Promise<void> {
    if (this.rootDir) return;

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      this.context = this._getExecutionContext();

      if (this.context === "unknown") {
        throw new Error("Unsupported execution context for OPFS");
      }

      if (!navigator?.storage?.getDirectory) {
        throw new Error("OPFS is not supported in this browser");
      }

      this.rootDir = await navigator.storage.getDirectory();
    })();

    await this.initPromise;
  }

  /**
   * Save a file to OPFS
   * Works in both window and worker contexts
   * @param path - File path (can include subdirectories, e.g., "videos/movie.mp4")
   * @param data - Data to write (string, ArrayBuffer, Blob, or TypedArray)
   */
  static async saveFile(
    path: string,
    data: string | ArrayBuffer | Blob | ArrayBufferView,
  ): Promise<void> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    const { dirHandle, fileName } = await this._ensureDirectory(path);
    const fileHandle = await dirHandle.getFileHandle(fileName, {
      create: true,
    });

    if (this.context === "worker") {
      // Use synchronous API in worker for better performance
      const syncHandle = await (fileHandle as any).createSyncAccessHandle();
      try {
        let buffer: ArrayBuffer;

        if (typeof data === "string") {
          buffer = new TextEncoder().encode(data).buffer;
        } else if (data instanceof ArrayBuffer) {
          buffer = data;
        } else if (ArrayBuffer.isView(data)) {
          buffer = data.buffer.slice(
            data.byteOffset,
            data.byteOffset + data.byteLength,
          );
        } else if (data instanceof Blob) {
          buffer = await data.arrayBuffer();
        } else {
          throw new Error("Unsupported data type");
        }

        syncHandle.truncate(0);
        syncHandle.write(buffer);
        syncHandle.flush();
      } finally {
        syncHandle.close();
      }
    } else {
      // Use async writable stream API in window context
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    }

    // Emit event that a file was added
    this.emitChange({ type: "file-added", path });
  }

  /**
   * Read a file from OPFS
   * Works in both window and worker contexts
   * @param path - File path
   * @returns ArrayBuffer containing the file data
   */
  static async readFile(path: string): Promise<ArrayBuffer> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    const { dirHandle, fileName } = await this._ensureDirectory(path, false);
    const fileHandle = await dirHandle.getFileHandle(fileName);

    if (this.context === "worker") {
      // Use synchronous API in worker
      const syncHandle = await (fileHandle as any).createSyncAccessHandle();
      try {
        const size = syncHandle.getSize();
        const buffer = new ArrayBuffer(size);
        syncHandle.read(buffer, { at: 0 });
        return buffer;
      } finally {
        syncHandle.close();
      }
    } else {
      // Use File API in window context
      const file = await fileHandle.getFile();
      return await file.arrayBuffer();
    }
  }

  /**
   * Get file details (size and existence)
   * Works in both window and worker contexts
   * @param path - File path
   * @returns Object with file existence status and size in bytes
   */
  static async getFileDetails(
    path: string,
  ): Promise<{ exists: boolean; size: number }> {
    try {
      await this._ensureInit();
      if (!this.rootDir) return { exists: false, size: 0 };

      const { dirHandle, fileName } = await this._ensureDirectory(path, false);
      const fileHandle = await dirHandle.getFileHandle(fileName);

      if (this.context === "worker") {
        const syncHandle = await (fileHandle as any).createSyncAccessHandle();
        try {
          const size = syncHandle.getSize();
          return { exists: true, size };
        } finally {
          syncHandle.close();
        }
      } else {
        const file = await fileHandle.getFile();
        return { exists: true, size: file.size };
      }
    } catch {
      return { exists: false, size: 0 };
    }
  }

  /**
   * List all directories in OPFS root or a specific path
   * Works in both window and worker contexts
   * @param path - Optional path to list directories from (defaults to root)
   * @returns Array of directory names
   */
  static async listDirectories(path: string = ""): Promise<string[]> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    let dirHandle = this.rootDir;

    // Navigate to the specified path if provided
    if (path) {
      const parts = path.split("/").filter(Boolean);
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: false });
      }
    }

    const directories: string[] = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") {
        directories.push(name);
      }
    }

    return directories;
  }

  /**
   * List all files in a specific directory
   * Works in both window and worker contexts
   * @param path - Path to list files from
   * @returns Array of file names
   */
  static async listFiles(path: string = ""): Promise<string[]> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    let dirHandle = this.rootDir;

    // Navigate to the specified path if provided
    if (path) {
      const parts = path.split("/").filter(Boolean);
      for (const part of parts) {
        dirHandle = await dirHandle.getDirectoryHandle(part, { create: false });
      }
    }

    const files: string[] = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "file") {
        files.push(name);
      }
    }

    return files;
  }

  /**
   * Delete a file from OPFS
   * Works in both window and worker contexts
   * @param path - File path to delete
   */
  static async deleteFile(path: string): Promise<void> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    const { dirHandle, fileName } = await this._ensureDirectory(path, false);
    await dirHandle.removeEntry(fileName);

    // Emit event that a file was deleted
    this.emitChange({ type: "file-deleted", path });
  }

  /**
   * Delete a directory and all its contents from OPFS
   * Works in both window and worker contexts
   * @param path - Directory path to delete
   */
  static async deleteDirectory(path: string): Promise<void> {
    await this._ensureInit();
    if (!this.rootDir) throw new Error("OPFS not initialized");

    const parts = path.split("/").filter(Boolean);
    const dirName = parts.pop();

    if (!dirName) {
      throw new Error("Invalid directory path");
    }

    let parentHandle = this.rootDir;

    // Navigate to the parent directory
    for (const part of parts) {
      parentHandle = await parentHandle.getDirectoryHandle(part, {
        create: false,
      });
    }

    // Remove the directory recursively
    await parentHandle.removeEntry(dirName, { recursive: true });

    // Emit event that a directory was deleted
    this.emitChange({ type: "directory-deleted", path });
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private static async _ensureDirectory(
    path: string,
    create: boolean = true,
  ): Promise<{ dirHandle: FileSystemDirectoryHandle; fileName: string }> {
    if (!this.rootDir) throw new Error("OPFS not initialized");

    const parts = path.split("/").filter(Boolean);
    const fileName = parts.pop();

    if (!fileName) {
      throw new Error("Invalid file path");
    }

    let dirHandle = this.rootDir;

    for (const part of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(part, { create });
    }

    return { dirHandle, fileName };
  }
}
