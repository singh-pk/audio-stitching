import { useState, useEffect, useCallback, useMemo } from "react";

import {
  OpfsStorage,
  OPFS_CHANGE_EVENT,
  type OpfsChangeDetail,
  type AudioMetadata,
} from "../utils";

/**
 * Custom hook to reactively track OPFS directories
 * Automatically updates when files are added or removed
 */
export const useOpfsDirectories = () => {
  const [folders, setFolders] = useState<AudioMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFolders = useCallback(async () => {
    try {
      const directories = await OpfsStorage.listDirectories();

      // Load metadata for each directory
      const foldersWithMetadata = (
        await Promise.all(
          directories.map(async (name) => {
            // Try to load metadata.json from the folder
            const metadataPath = `${name}/metadata.json`;
            const buffer = await OpfsStorage.readFile(metadataPath);
            const text = new TextDecoder().decode(buffer);
            return JSON.parse(text) as AudioMetadata;
          }),
        )
      ).sort((a, b) => b.uploadedAt - a.uploadedAt);

      setFolders(foldersWithMetadata);
      setError(null);
    } catch (err) {
      console.error("Failed to load folders from OPFS:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleOpfsChange = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<OpfsChangeDetail>;
      const { type, path } = customEvent.detail;

      console.log(`OPFS change detected: ${type} at ${path}`);

      // Reload folders when a file is added (which creates a directory)
      if (
        type === "file-added" ||
        type === "directory-added" ||
        type === "file-deleted" ||
        type === "directory-deleted"
      ) {
        loadFolders();
      }
    },
    [loadFolders],
  );

  // Listen for OPFS changes
  useEffect(() => {
    window.addEventListener(OPFS_CHANGE_EVENT, handleOpfsChange);

    return () => {
      window.removeEventListener(OPFS_CHANGE_EVENT, handleOpfsChange);
    };
  }, [handleOpfsChange]);

  const getAllFiles = useCallback(async (): Promise<
    Array<{ metadata: AudioMetadata; buffer: ArrayBuffer }>
  > => {
    const directories = await OpfsStorage.listDirectories();

    const buffers = await Promise.all(
      directories.map(async (folderName) => {
        try {
          // Get all files in the directory
          const files = await OpfsStorage.listFiles(folderName);

          // Find the audio file (exclude metadata.json)
          const audioFile = files.find((file) => file !== "metadata.json");

          if (!audioFile) {
            console.warn(`No audio file found in folder: ${folderName}`);
            return null;
          }

          // Read the metadata
          const metadataPath = `${folderName}/metadata.json`;
          const metadataBuffer = await OpfsStorage.readFile(metadataPath);
          const metadataText = new TextDecoder().decode(metadataBuffer);
          const metadata = JSON.parse(metadataText) as AudioMetadata;

          // Read the audio file buffer
          const audioPath = `${folderName}/${audioFile}`;
          const buffer = await OpfsStorage.readFile(audioPath);

          return { metadata, buffer };
        } catch (err) {
          console.error(`Failed to read files from folder ${folderName}:`, err);
          return null;
        }
      }),
    );

    // Filter out null values (failed reads) and sort by uploadedAt descending
    return buffers
      .filter(
        (item): item is { metadata: AudioMetadata; buffer: ArrayBuffer } =>
          item !== null,
      )
      .sort((a, b) => b.metadata.uploadedAt - a.metadata.uploadedAt);
  }, []);

  const deleteFolder = useCallback(async (folderName: string) => {
    try {
      await OpfsStorage.deleteDirectory(folderName);
      console.log(`Successfully deleted folder: ${folderName}`);
    } catch (err) {
      console.error(`Failed to delete folder ${folderName}:`, err);
      throw err;
    }
  }, []);

  return useMemo(
    () => ({ folders, isLoading, error, getAllFiles, deleteFolder }),
    [folders, isLoading, error, getAllFiles, deleteFolder],
  );
};
