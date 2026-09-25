import MDX_Component_Accordions, { Accordion } from "./Accordions";
import MDX_Component_Badge from "./Badge";
import MDX_Component_Callout from "./Callout";
import MDX_Component_Cards, { Card } from "./Cards";
import MDX_Component_Columns, { Column } from "./Columns";
import MDX_Component_Iframe from "./Iframe";
import MDX_Component_CodeBlock from "./CodeBlock";
import MDX_Component_Mermaid from "./MermaidClient";
import MDX_Component_Tabs, { Tab } from "./Tabs";

export {
  Accordion,
  Card,
  Column,
  Tab,
  MDX_Component_Callout as Callout,
  MDX_Component_Accordions as Accordions,
  MDX_Component_Badge as Badge,
  MDX_Component_Cards as Cards,
  MDX_Component_Columns as Columns,
  MDX_Component_Tabs as Tabs,
  MDX_Component_Mermaid as Mermaid,
  MDX_Component_Iframe as Iframe,
  MDX_Component_CodeBlock as CodeBlock,
};

export default {
  Callout: MDX_Component_Callout,
  Accordions: MDX_Component_Accordions,
  Accordion,
  Badge: MDX_Component_Badge,
  Cards: MDX_Component_Cards,
  Card,
  Columns: MDX_Component_Columns,
  Column,
  Tabs: MDX_Component_Tabs,
  Tab,
  Mermaid: MDX_Component_Mermaid,
  Iframe: MDX_Component_Iframe,
  CodeBlock: MDX_Component_CodeBlock,
};
