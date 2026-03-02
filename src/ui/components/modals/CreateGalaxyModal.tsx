"use client";

import { FormEvent, useState } from "react";
import { GalaxyShapeValue } from "../../../types/galaxy.types";
import styles from "../../../styles/skeleton.module.css";
import { ActionButton } from "../buttons/ActionButton";

const SHAPES: GalaxyShapeValue[] = ["spherical", "3-arm spiral", "5-arm spiral", "irregular"];

type CreateGalaxyModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    shape: GalaxyShapeValue;
    systemCount: number;
  }) => Promise<void>;
};

export function CreateGalaxyModal({ open, onClose, onSubmit }: CreateGalaxyModalProps) {
  const [name, setName] = useState("");
  const [shape, setShape] = useState<GalaxyShapeValue>("spherical");
  const [systemCount, setSystemCount] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name,
        shape,
        systemCount: Number(systemCount),
      });
      setName("");
      setShape("spherical");
      setSystemCount(12);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create galaxy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <article className={styles.modalCard}>
        <h2 className={styles.panelTitle}>Create Galaxy</h2>
        <p className={styles.subtitle}>This will call backend and update your list.</p>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="galaxy-name">Name</label>
            <input
              id="galaxy-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={4}
              maxLength={14}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="galaxy-shape">Shape</label>
            <select
              id="galaxy-shape"
              value={shape}
              onChange={(event) => setShape(event.target.value as GalaxyShapeValue)}
            >
              {SHAPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="galaxy-systems">System count</label>
            <input
              id="galaxy-systems"
              type="number"
              min={1}
              max={1000}
              value={systemCount}
              onChange={(event) => setSystemCount(Number(event.target.value))}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <ActionButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Galaxy"}
            </ActionButton>
            <ActionButton variant="secondary" type="button" onClick={onClose}>
              Cancel
            </ActionButton>
          </div>
        </form>
      </article>
    </div>
  );
}
