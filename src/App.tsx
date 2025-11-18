import { Box, Flex, Grid, Text } from "@radix-ui/themes";

import { useOpfsDirectories } from "./hooks";

import { AddNew, Cards, StitchAudio } from "./components";
import { useCallback } from "react";

function App() {
  const { folders, isLoading, deleteFolder } = useOpfsDirectories();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      const item = (e.target as HTMLElement).closest("[data-id]");
      if (!item) return;

      const name = item.getAttribute("data-id")!;
      deleteFolder(name);
    },
    [deleteFolder],
  );

  return (
    <Flex p="9" minWidth="fit-content" direction="column" gap="9">
      <Grid columns="5" gap="8" onClick={onClick}>
        <AddNew />

        {isLoading ? (
          <Box>Loading videos...</Box>
        ) : (
          folders.map((folder) => (
            <Cards
              key={folder.name}
              id={folder.name}
              title={folder.name}
              cover={folder.cover}
              color={folder.color}
            />
          ))
        )}
      </Grid>

      <StitchAudio />
    </Flex>
  );
}

export default App;
