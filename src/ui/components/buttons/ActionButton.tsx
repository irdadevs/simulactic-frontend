"use client";

import { ButtonHTMLAttributes } from "react";
import styles from "../../../styles/skeleton.module.css";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function ActionButton({ variant = "primary", className, ...props }: ActionButtonProps) {
  const baseClass = variant === "primary" ? styles.button : styles.buttonSecondary;
  const mergedClassName = className ? `${baseClass} ${className}` : baseClass;
  return <button className={mergedClassName} {...props} />;
}
