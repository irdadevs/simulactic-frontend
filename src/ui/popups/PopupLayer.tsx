"use client";

import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { usePopupController } from "../../application/hooks/usePopupController";
import {
  asteroidDetailItems,
  starDetailItems,
} from "../../lib/format/celestialDetails";
import { useRenderStore } from "../../state/render.store";
import { useUiStore } from "../../state/ui.store";
import popupStyles from "../../styles/popup.module.css";
import commonStyles from "../../styles/skeleton.module.css";
import { MoonPopup } from "./MoonPopup";
import { PlanetPopup } from "./PlanetPopup";
import { SystemPopup } from "./SystemPopup";

type PositionedBox = {
  left: number;
  top: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const resolveBoxPosition = (
  anchor: { x: number; y: number },
  layer: DOMRect,
  box: { width: number; height: number },
  gap: number,
  margin: number,
): PositionedBox => {
  const availableAbove = anchor.y - margin;
  const availableBelow = layer.height - anchor.y - margin;
  const preferAbove = availableAbove >= box.height + gap || availableAbove >= availableBelow;

  const idealTop = preferAbove ? anchor.y - gap - box.height : anchor.y + gap;
  const maxLeft = Math.max(margin, layer.width - box.width - margin);
  const maxTop = Math.max(margin, layer.height - box.height - margin);

  return {
    left: clamp(anchor.x - box.width / 2, margin, maxLeft),
    top: clamp(idealTop, margin, maxTop),
  };
};

export function PopupLayer() {
  const { popup } = usePopupController();
  const requestSystemTransition = useRenderStore((state) => state.requestSystemTransition);
  const popupLoading = useUiStore((state) => state.popupLoading);
  const popupAnchor = useUiStore((state) => state.popupAnchor);
  const setPopup = useUiStore((state) => state.setPopup);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | undefined>(undefined);
  const [loaderStyle, setLoaderStyle] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (!popupAnchor) {
      setPopupStyle(undefined);
      setLoaderStyle(undefined);
      return;
    }

    const place = () => {
      const layerEl = layerRef.current;
      if (!layerEl) return;
      const layerRect = layerEl.getBoundingClientRect();

      if (popupRef.current) {
        const popupRect = popupRef.current.getBoundingClientRect();
        const popupPos = resolveBoxPosition(
          popupAnchor,
          layerRect,
          { width: popupRect.width, height: popupRect.height },
          14,
          12,
        );
        setPopupStyle({
          left: popupPos.left,
          top: popupPos.top,
          visibility: "visible",
        });
      } else {
        setPopupStyle(undefined);
      }

      if (loaderRef.current) {
        const loaderRect = loaderRef.current.getBoundingClientRect();
        const loaderPos = resolveBoxPosition(
          popupAnchor,
          layerRect,
          { width: loaderRect.width, height: loaderRect.height },
          10,
          10,
        );
        setLoaderStyle({
          left: loaderPos.left,
          top: loaderPos.top,
          visibility: "visible",
        });
      } else {
        setLoaderStyle(undefined);
      }
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [popupAnchor, popup, popupLoading]);

  const renderPopupContainer = (content: ReactNode) => (
    <div
      ref={popupRef}
      className={popupStyles.popupPositioned}
      style={popupStyle ?? { visibility: "hidden" }}
    >
      {content}
    </div>
  );

  if (!popup && !popupLoading) return null;

  return (
    <div ref={layerRef} className={popupStyles.popupLayer}>
      {popupLoading && (
        <div
          ref={loaderRef}
          className={popupStyles.popupLoader}
          style={loaderStyle ?? { visibility: "hidden" }}
          aria-label="Preparing popup"
        >
          <span className={popupStyles.popupLoaderSpinner} />
        </div>
      )}

      {popup?.kind === "system" && (
        renderPopupContainer(
          <SystemPopup
            system={popup.data.system}
            stars={popup.data.stars}
            planets={popup.data.planets.map((entry) => entry.planet)}
            onGoToSystem={() => {
              requestSystemTransition({
                systemId: popup.data.system.id,
                reason: "user_select_system",
              });
              setPopup(null);
            }}
            onClose={() => setPopup(null)}
          />
        )
      )}

      {popup?.kind === "planet" && (
        renderPopupContainer(
          <PlanetPopup
            planet={popup.data.planet}
            moons={popup.data.moons}
            onClose={() => setPopup(null)}
          />
        )
      )}

      {popup?.kind === "moon" && (
        renderPopupContainer(<MoonPopup moon={popup.data} onClose={() => setPopup(null)} />)
      )}

      {popup?.kind === "star" && (
        renderPopupContainer(
          <section className={`${popupStyles.popupCard} ${popupStyles.popupCardRich}`}>
            <header className={popupStyles.popupHeader}>
              <div>
                <p className={popupStyles.popupEyebrow}>Star</p>
                <h3 className={popupStyles.popupTitle}>{popup.data.name}</h3>
              </div>
            </header>
            <div className={popupStyles.popupBody}>
              {starDetailItems(popup.data).map((item) => (
                <p key={item.label} className={commonStyles.meta}>
                  {item.label}: <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          </section>
        )
      )}

      {popup?.kind === "asteroid" && (
        renderPopupContainer(
          <section className={`${popupStyles.popupCard} ${popupStyles.popupCardRich}`}>
            <header className={popupStyles.popupHeader}>
              <div>
                <p className={popupStyles.popupEyebrow}>Asteroid</p>
                <h3 className={popupStyles.popupTitle}>{popup.data.name}</h3>
              </div>
            </header>
            <div className={popupStyles.popupBody}>
              {asteroidDetailItems(popup.data).map((item) => (
                <p key={item.label} className={commonStyles.meta}>
                  {item.label}: <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
