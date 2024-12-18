import { useTranslation } from "react-i18next";

export const RequiredField = () => {
  return <span className="text-teal-400">(*)</span>;
};

export const RequiredLabel = () => {
  const { t } = useTranslation();
  return <p className="py-4 text-teal-400">Field is required</p>;
};
