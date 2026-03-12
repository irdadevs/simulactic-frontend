import commonStyles from "../../../styles/skeleton.module.css";

type AdminSectionStateNoticeProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
};

export function AdminSectionStateNotice({
  loading,
  error,
  empty,
  emptyMessage,
}: AdminSectionStateNoticeProps) {
  if (loading) {
    return <p className={commonStyles.meta}>Loading section data...</p>;
  }

  if (empty) {
    return <p className={commonStyles.meta}>{emptyMessage}</p>;
  }

  return null;
}
