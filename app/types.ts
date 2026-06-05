import type { TemplateResult } from "lit";

export type DocProp = {
  name: string;
  type: string;
  default: string;
  desc: string;
};

export type DocEvent = {
  name: string;
  detail: string;
  desc: string;
};

export type DocSlot = {
  name: string;
  desc: string;
  priority?: string;
};

export type DocCssVar = {
  name: string;
  default?: string;
  desc: string;
};

export type DocMethod = {
  name: string;
  signature: string;
  desc: string;
};

export type DocSection = {
  id: string;
  title: string;
  content?: string;
};

export type ComponentDocPage = {
  kind: "component";
  id: string;
  title: string;
  tag: string;
  className: string;
  importPath: string;
  description: string;
  usageCode: string;
  demoId: string;
  props: DocProp[];
  events: DocEvent[];
  slots: DocSlot[];
  cssVars: DocCssVar[];
  methods?: DocMethod[];
  notes?: string[];
};

export type GuideDocPage = {
  kind: "guide";
  id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    body: string;
    code?: string;
    lang?: string;
  }>;
};

export type DocPage = ComponentDocPage | GuideDocPage;

export type NavGroup = {
  title: string;
  items: Array<{ id: string; label: string }>;
};

export type DemoRenderer = () => TemplateResult;
