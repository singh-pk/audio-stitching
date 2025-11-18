import styles from "./Hover.module.css";

const HoverRoot = (props: React.ComponentPropsWithoutRef<"div">) => (
  <div
    {...props}
    className={
      props.className
        ? `${props.className} ${styles.hoverRoot}`
        : styles.hoverRoot
    }
  />
);

const HoverShow = (props: React.ComponentPropsWithoutRef<"div">) => (
  <div
    {...props}
    className={
      props.className
        ? `${props.className} ${styles.hoverShow}`
        : styles.hoverShow
    }
  />
);

export const Hover = {
  Root: HoverRoot,
  Show: HoverShow,
};
