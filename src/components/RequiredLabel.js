import { useTranslation } from "react-i18next";

export const RequiredField = () => {
  return <span className="text-secondary ml-1">(*)</span>;
};

export const RequiredLabel = () => {
  const { t } = useTranslation();
  return <p className="py-4 text-secondary">Field is required</p>;
};
