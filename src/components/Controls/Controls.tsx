import { Box, Flex, IconButton, Slider, Text } from "@radix-ui/themes";

import styles from "./Controls.module.css";

const VolumeMaxIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    width="20"
    height="20"
    fill="currentcolor"
    fillOpacity={0.7}
    {...props}
  >
    <path d="M 20.037109 5.6464844 A 1.0001 1.0001 0 0 0 19.236328 7.2734375 C 20.963426 9.4832305 22 12.243759 22 15.255859 C 22 18.055119 21.105815 20.636923 19.59375 22.763672 A 1.0001 1.0001 0 1 0 21.222656 23.921875 C 22.962591 21.474623 24 18.4826 24 15.255859 C 24 11.78396 22.799402 8.5851757 20.8125 6.0429688 A 1.0001 1.0001 0 0 0 20.037109 5.6464844 z M 11 7 L 6.7929688 11 L 3 11 C 1.343 11 0 12.343 0 14 L 0 16 C 0 17.657 1.343 19 3 19 L 6.7929688 19 L 11 23 L 11 7 z M 14.738281 8.5917969 A 1.0001 1.0001 0 0 0 14.001953 10.291016 C 15.239451 11.587484 16 13.328154 16 15.255859 C 16 16.979025 15.392559 18.553804 14.380859 19.796875 A 1.0001 1.0001 0 1 0 15.931641 21.058594 C 17.219941 19.475665 18 17.450694 18 15.255859 C 18 12.799565 17.023721 10.559688 15.449219 8.9101562 A 1.0001 1.0001 0 0 0 14.738281 8.5917969 z" />
  </svg>
);

const VolumeNoneIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    width="20"
    height="20"
    fill="currentcolor"
    fillOpacity={0.7}
    {...props}
  >
    <path d="M16.3333 4.66669L13.5286 7.33335H11C9.89533 7.33335 9 8.22869 9 9.33335V10.6667C9 11.7714 9.89533 12.6667 11 12.6667H13.5286L16.3333 15.3334V4.66669Z" />
  </svg>
);

interface Controls {
  disabled?: boolean;
  duration: number; // in sec
  currTime: number; // in sec
  onPlayClick: VoidFunction;
  isPlaying: boolean;
  defaultVolume: number; // 0-100
  onVolumeChange: (volume: number) => void;
}

export const Controls = ({
  disabled,
  duration,
  currTime,
  onPlayClick,
  isPlaying,
  defaultVolume,
  onVolumeChange,
}: Controls) => {
  const tabIndex = -1;

  // Format time in seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate the progress width as a percentage
  const progressPercentage = duration > 0 ? (currTime / duration) * 100 : 0;
  const progressWidth = `${Math.min(progressPercentage, 100)}%`;

  return (
    <Flex
      position="absolute"
      left="0px"
      right="0px"
      bottom="10px"
      height="64px"
      justify="center"
    >
      <Flex
        height="100%"
        width="60%"
        justify="between"
        position="relative"
        style={{
          borderRadius: "100px",
          boxShadow: "var(--shadow-6)",
          backgroundColor: "var(--color-floating-panel)",
          filter: "saturate(0.5) brightness(1.1)",
        }}
      >
        <Flex gap="4" align="center" p="3">
          <IconButton
            tabIndex={tabIndex}
            radius="full"
            size="3"
            disabled={disabled}
            onClick={onPlayClick}
            className={styles.playButton}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentcolor"
              viewBox="0 0 30 30"
              width="20"
              height="20"
              className={`${styles.playIcon} ${isPlaying ? styles.hidden : styles.visible}`}
            >
              <path d="M 6 3 A 1 1 0 0 0 5 4 A 1 1 0 0 0 5 4.0039062 L 5 15 L 5 25.996094 A 1 1 0 0 0 5 26 A 1 1 0 0 0 6 27 A 1 1 0 0 0 6.5800781 26.8125 L 6.5820312 26.814453 L 26.416016 15.908203 A 1 1 0 0 0 27 15 A 1 1 0 0 0 26.388672 14.078125 L 6.5820312 3.1855469 L 6.5800781 3.1855469 A 1 1 0 0 0 6 3 z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentcolor"
              viewBox="0 0 30 30"
              width="20"
              height="20"
              className={`${styles.pauseIcon} ${isPlaying ? styles.visible : styles.hidden}`}
            >
              <path d="M 6 3 C 5.448 3 5 3.448 5 4 L 5 26 C 5 26.552 5.448 27 6 27 L 11 27 C 11.552 27 12 26.552 12 26 L 12 4 C 12 3.448 11.552 3 11 3 L 6 3 z M 19 3 C 18.448 3 18 3.448 18 4 L 18 26 C 18 26.552 18.448 27 19 27 L 24 27 C 24.552 27 25 26.552 25 26 L 25 4 C 25 3.448 24.552 3 24 3 L 19 3 z" />
            </svg>
          </IconButton>
        </Flex>

        <Flex align="center" gap="3" ml="9">
          <Box
            position="relative"
            height="4px"
            width="320px"
            style={{
              backgroundColor: "var(--gray-a5)",
              borderRadius: "var(--radius-1)",
            }}
          >
            <Box
              position="absolute"
              height="4px"
              width={progressWidth}
              style={{
                borderRadius: "var(--radius-1)",
                backgroundColor: "var(--gray-a9)",
              }}
            />
            <Box position="absolute" top="0" right="0" mt="-28px">
              <Text size="1" color="gray">
                {formatTime(currTime)} / {formatTime(duration)}
              </Text>
            </Box>
          </Box>
        </Flex>

        <Flex align="center" gap="2" p="5">
          <VolumeNoneIcon color="var(--gray-a9)" />

          <Slider
            tabIndex={tabIndex}
            defaultValue={[defaultVolume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            variant="soft"
            color="gray"
            radius="full"
            size="2"
            min={0}
            max={100}
            style={{ width: 80 }}
          />

          <VolumeMaxIcon color="var(--gray-a9)" />
        </Flex>
      </Flex>
    </Flex>
  );
};
