import { useState } from "react";
import { AspectRatio, Box, Card, Inset, Text } from "@radix-ui/themes";

import { Hover } from "../Hover";

import {
  OpfsStorage,
  createAudioMetadata,
  isValidAudioFile,
} from "../../utils";

import styles from "./AddNew.module.css";

const color = "hsl(339, 80%, 60%)";

export const AddNew = () => {
  const [isUploading, setIsUploading] = useState(false);

  const getAudioFolderName = (file: File): string => {
    // Remove file extension and use as folder name
    return file.name.replace(/\.[^/.]+$/, "");
  };

  const handleFileUpload = async (file: File) => {
    if (!isValidAudioFile(file)) {
      alert("Please upload a valid audio file");
      return;
    }

    setIsUploading(true);

    try {
      const folderName = getAudioFolderName(file);
      const filePath = `${folderName}/${file.name}`;

      // Create metadata for the audio
      const metadata = createAudioMetadata(
        file,
        folderName,
        `${window.location.origin}/audio-thumbnail.jpg`,
      );

      // Upload file to OPFS
      await OpfsStorage.saveFile(filePath, file);

      // Save metadata as JSON in the same folder
      const metadataPath = `${folderName}/metadata.json`;
      const metadataJson = JSON.stringify(metadata, null, 2);

      await OpfsStorage.saveFile(metadataPath, metadataJson);
    } catch (error) {
      console.error("Failed to upload audio:", error);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = async () => {
    if (isUploading) return;

    try {
      // Use File System Access API to pick file
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Audio",
            accept: {
              "audio/*": [],
            },
          },
        ],
        multiple: false,
      });

      const file = await fileHandle.getFile();
      await handleFileUpload(file);
    } catch (error) {
      // User cancelled the picker or browser doesn't support the API
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to open file picker:", error);
      }
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Hover.Root>
      <Box mb="2" position="relative">
        <Card
          style={{
            boxShadow: `0 8px 48px -16px ${color.replace("%)", "%, 0.6)")}`,
            cursor: isUploading ? "wait" : "pointer",
            opacity: isUploading ? 0.6 : 1,
          }}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Inset className={styles.wrapper}>
            <AspectRatio ratio={1}>
              {isUploading ? (
                <Text size="2">Uploading...</Text>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.svg}
                >
                  <title>Add new audio</title>
                  <path
                    d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                    fill="var(--accent-7)"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </AspectRatio>
          </Inset>
        </Card>
      </Box>

      <Text size="2">{isUploading ? "Uploading..." : "Add new audio"}</Text>
    </Hover.Root>
  );
};
