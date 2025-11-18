import {
  AspectRatio,
  Box,
  Card,
  IconButton,
  Inset,
  Text,
} from "@radix-ui/themes";

import { Hover } from "../Hover";

import styles from "./Cards.module.css";

interface Cards {
  id: string;
  title: string;
  cover: string;
  color: string;
}

export const Cards = ({ id, title, cover, color }: Cards) => {
  return (
    <Hover.Root data-id={id}>
      <Box mb="2" position="relative">
        <Card
          style={{
            boxShadow: `0 8px 48px -16px ${color.replace("%)", "%, 0.6)")}`,
          }}
        >
          <Inset>
            <AspectRatio ratio={1}>
              <img
                src={cover}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={title}
              />
            </AspectRatio>
          </Inset>

          <Hover.Show className={styles.delete}>
            <IconButton radius="full" size="2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </IconButton>
          </Hover.Show>
        </Card>
      </Box>

      <Text size="2">{title}</Text>
    </Hover.Root>
  );
};
