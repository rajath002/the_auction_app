export type ContextType = {
  params: { [key: string]: string };
  query: { [key: string]: string };
  preview: boolean;
  previewData: any;
  resolvedUrl: string;
  locale: string;
  defaultLocale: string;
};
