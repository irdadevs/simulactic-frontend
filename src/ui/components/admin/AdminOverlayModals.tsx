import { sileo } from "sileo";
import { describeApiError } from "../../../lib/errors/apiErrorMessage";
import styles from "../../../styles/admin.module.css";
import { LogProps } from "../../../types/log.types";
import { BanModal } from "./BanModal";
import { LogDetailsModal } from "./LogDetailsModal";

type BanDraft =
  | { kind: "user"; logId: string; userId: string; ipAddress: null }
  | { kind: "ip"; logId: string; userId: null; ipAddress: string };

type AdminOverlayModalsProps = {
  focusGalaxyId: string | null;
  onCloseGalaxy: () => void;
  selectedLog: LogProps | null;
  adminNoteDraft: string;
  adminNoteSaving: boolean;
  selectedLogBanUserTarget: string | null;
  selectedLogBanIpTarget: string | null;
  dateText: (date: Date) => string;
  onCloseLog: () => void;
  onNoteChange: (value: string) => void;
  onSaveNote: (logId: string) => Promise<void>;
  onDeleteNote: (logId: string) => Promise<void>;
  onOpenBanUser: (log: LogProps, target: string) => void;
  onOpenBanIp: (log: LogProps, target: string) => void;
  banDraft: BanDraft | null;
  banReasonDraft: string;
  banExpiresAtDraft: string;
  banSaving: boolean;
  onCloseBan: () => void;
  onBanReasonChange: (value: string) => void;
  onBanExpiresAtChange: (value: string) => void;
  onConfirmBan: () => Promise<void>;
};

export function AdminOverlayModals(props: AdminOverlayModalsProps) {
  return (
    <>
      {props.focusGalaxyId && (
        <div className={styles.fullscreenModal}>
          <button className={styles.fullscreenClose} onClick={props.onCloseGalaxy}>Close</button>
          <iframe className={styles.fullscreenFrame} src={`/dashboard?galaxyId=${props.focusGalaxyId}&embed=1`} title="Galaxy interactive view" />
        </div>
      )}
      {props.selectedLog ? (
        <LogDetailsModal
          log={props.selectedLog}
          adminNoteDraft={props.adminNoteDraft}
          adminNoteSaving={props.adminNoteSaving}
          canBanUser={Boolean(props.selectedLogBanUserTarget)}
          canBanIp={Boolean(props.selectedLogBanIpTarget)}
          dateText={props.dateText}
          onClose={props.onCloseLog}
          onNoteChange={props.onNoteChange}
          onSaveNote={() => props.onSaveNote(props.selectedLog!.id)}
          onDeleteNote={() => props.onDeleteNote(props.selectedLog!.id)}
          onBanUser={() => {
            if (!props.selectedLogBanUserTarget) {
              sileo.error({ title: "User unavailable", description: "This log does not include a user target that can be banned." });
              return;
            }
            props.onOpenBanUser(props.selectedLog!, props.selectedLogBanUserTarget);
          }}
          onBanIp={() => {
            if (!props.selectedLogBanIpTarget) {
              sileo.error({ title: "IP unavailable", description: "This log does not include an IP target that can be banned." });
              return;
            }
            props.onOpenBanIp(props.selectedLog!, props.selectedLogBanIpTarget);
          }}
        />
      ) : null}
      {props.banDraft ? (
        <BanModal
          kind={props.banDraft.kind}
          logId={props.banDraft.logId}
          target={props.banDraft.kind === "user" ? props.banDraft.userId : props.banDraft.ipAddress}
          reason={props.banReasonDraft}
          expiresAt={props.banExpiresAtDraft}
          saving={props.banSaving}
          onClose={props.onCloseBan}
          onReasonChange={props.onBanReasonChange}
          onExpiresAtChange={props.onBanExpiresAtChange}
          onConfirm={() =>
            props.onConfirmBan().catch((error: unknown) => {
              sileo.error({
                title: "Ban failed",
                description: describeApiError(error, "Could not create the ban."),
              });
              throw error;
            })
          }
        />
      ) : null}
    </>
  );
}
