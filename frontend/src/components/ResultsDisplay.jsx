/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Search,
  Copy,
  Filter,
  Globe,
  Code,
  Download,
  Database,
  FileCode,
  LayoutGrid,
  Braces,
  Image as ImageIcon,
  Link,
  Heading,
  FileText,
  FormInput,
  Layers,
  Eye,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import APIResponseDisplay from "./APIResponseDisplay";

const ResultsDisplay = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // For DOM structure tab
  const [domSearchTerm, setDomSearchTerm] = useState("");
  const [domFilterType, setDomFilterType] = useState("all");

  useEffect(() => {
    if (!results) return;

    // Apply filtering
    if (results?.success && results?.data) {
      if (results.type === "static") {
        const searchTermLower = searchTerm.toLowerCase();

        // Filter links
        const filteredLinks = results.data?.links?.filter((link) => {
          return (
            link?.text?.toLowerCase().includes(searchTermLower) ||
            link?.href?.toLowerCase().includes(searchTermLower)
          );
        });

        // Filter headings
        const filteredHeadings = results.data?.headings?.filter((heading) =>
          heading?.text?.toLowerCase().includes(searchTermLower)
        );

        // Filter images
        const filteredImages = results.data?.images?.filter(
          (image) =>
            image?.alt?.toLowerCase().includes(searchTermLower) ||
            image?.src?.toLowerCase().includes(searchTermLower)
        );

        // Filter element tree
        const filteredElementTree = results.data?.element_tree?.filter(
          (element) => {
            if (domFilterType !== "all" && element.tag !== domFilterType) {
              return false;
            }

            if (domSearchTerm) {
              const searchLower = domSearchTerm.toLowerCase();
              return (
                element.tag?.toLowerCase().includes(searchLower) ||
                element.path?.toLowerCase().includes(searchLower) ||
                element.id?.toLowerCase().includes(searchLower) ||
                element.classes?.some((cls) =>
                  cls?.toLowerCase().includes(searchLower)
                )
              );
            }

            return true;
          }
        );

        setFilteredData({
          ...results.data,
          links: filteredLinks || [],
          headings: filteredHeadings || [],
          images: filteredImages || [],
          element_tree: filteredElementTree || [],
        });
      } else {
        // For API results, just pass through the data
        setFilteredData(results.data);
      }
    }
  }, [results, searchTerm, activeTab, domSearchTerm, domFilterType]);

  if (!results) return null;

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(
      typeof content === "object" ? JSON.stringify(content, null, 2) : content
    );
  };

  const downloadJson = (data, filename = "scraped-data.json") => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderApiResults = (data) => {
    return (
      <APIResponseDisplay data={data} analytics={results?.analytics || {}} />
    );
  };

  const renderWebResults = (data) => {
    const tabContent = {
      all: (
        <div className="space-y-6">
          <div className="bg-card shadow-sm border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-medium">Page Information</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="font-medium mb-1">Title</div>
                <p className="text-lg">{data?.title || "No title found"}</p>
              </div>

              {data?.meta?.description && (
                <div>
                  <div className="font-medium mb-1">Description</div>
                  <p>{data?.meta?.description}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="font-medium mb-1">URL</div>
                  <div className="font-mono text-sm break-all">{data?.url}</div>
                </div>
                {data?.meta?.favicon && (
                  <div className="flex-shrink-0">
                    <div className="font-medium mb-1">Favicon</div>
                    <img
                      src={data?.meta?.favicon}
                      alt="Favicon"
                      className="h-10 w-10 border rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics summary */}
          {results?.analytics && (
            <div className="bg-card shadow-sm border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-medium">Page Analytics</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries({
                  "Total Tags": results.analytics?.total_tags_count || 0,
                  "Unique Tags": results.analytics?.tag_types_count || 0,
                  Links: results.analytics?.links_count || 0,
                  Images: results.analytics?.images_count || 0,
                  Headings: results.analytics?.headings_count || 0,
                  "CSS Files": results.analytics?.css_files_count || 0,
                  Scripts: results.analytics?.scripts_count || 0,
                  Forms: results.analytics?.forms_count || 0,
                  "Document Depth": results.analytics?.document_depth || 0,
                  "Processing Time": `${
                    results.analytics?.processing_time_seconds || 0
                  }s`,
                  "Page Size": `${Math.round(
                    (results.analytics?.page_size_bytes || 0) / 1024
                  )} KB`,
                }).map(([label, value]) => (
                  <div key={label} className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start with brief overview of sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heading className="h-4 w-4" /> Headings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-2xl font-semibold">
                  {data?.headings?.length || 0}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["h1", "h2", "h3", "h4", "h5", "h6"].map((level) => {
                    const count =
                      data?.headings?.filter((h) => h.level === level).length ||
                      0;
                    return count ? (
                      <Badge
                        key={level}
                        variant={level === "h1" ? "default" : "outline"}
                      >
                        {level}: {count}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="h-4 w-4" /> Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-2xl font-semibold">
                  {data?.links?.length || 0}
                </div>
                {data?.links?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      External:{" "}
                      {data?.links?.filter((link) => link.is_external).length ||
                        0}
                    </Badge>
                    <Badge variant="outline">
                      Internal:{" "}
                      {data?.links?.filter((link) => !link.is_external)
                        .length || 0}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Don't show full sections on overview tab */}
          <div className="text-center mt-4">
            <p className="text-muted-foreground mb-2">
              Switch to a specific tab for detailed information
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("structure")}
              >
                <FileCode className="w-4 h-4 mr-2" /> HTML Structure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("headings")}
              >
                <Heading className="w-4 h-4 mr-2" /> Headings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("links")}
              >
                <Link className="w-4 h-4 mr-2" /> Links
              </Button>
            </div>
          </div>
        </div>
      ),
      structure: renderStructureSection(data),
      headings: renderHeadingsSection(data?.headings),
      links: renderLinksTable(data?.links),
      images: renderImagesGrid(data?.images),
      css: renderCssSection(data),
      dom: renderDomExplorer(data),
    };

    return (
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">Overview</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="dom">
              DOM
              <Badge variant="outline" className="ml-2">
                {data?.element_tree?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="headings">
              Headings
              <Badge variant="outline" className="ml-2">
                {data?.headings?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="links">
              Links
              <Badge variant="outline" className="ml-2">
                {data?.links?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="images">
              Images
              <Badge variant="outline" className="ml-2">
                {data?.images?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search results..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">{tabContent.all}</TabsContent>
        <TabsContent value="structure">{tabContent.structure}</TabsContent>
        <TabsContent value="dom">{tabContent.dom}</TabsContent>
        <TabsContent value="headings">{tabContent.headings}</TabsContent>
        <TabsContent value="links">{tabContent.links}</TabsContent>
        <TabsContent value="images">{tabContent.images}</TabsContent>
        <TabsContent value="css">{tabContent.css}</TabsContent>
      </Tabs>
    );
  };

  // State for structure section

  function renderStructureSection(data) {
    const htmlStructure = data?.html_structure;
    if (!htmlStructure) return <p>No structure data available</p>;

    // Add this function to find tag examples
    const getTagExamples = (tagName) => {
      const elements =
        filteredData?.element_tree?.filter((el) => el.tag === tagName) || [];

      return elements.map((el) => ({
        path: el.path,
        text: el.text_content || "No text content", 
        text_length:
          el.text_length > 0 ? `${el.text_length} chars` : "No content",
        classes: el.classes,
        attributes: el.attributes,
      }));
    };

    return (
      <div className="space-y-6">
        {/* Tag distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Braces className="h-5 w-5" /> HTML Tags Distribution
            </CardTitle>
            <CardDescription>
              Overview of HTML tags used on the page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(htmlStructure.tag_counts || {})
                  .slice(0, 12)
                  .map(([tag, count]) => (
                    <div
                      key={tag}
                      className={`flex justify-between p-2 rounded-md cursor-pointer 
                      ${
                        selectedTag === tag
                          ? "bg-primary/20 border-primary border"
                          : "bg-muted/50"
                      }`}
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? null : tag)
                      }
                    >
                      <code className="text-sm font-semibold">
                        &lt;{tag}&gt;
                      </code>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
              </div>

              {/* tag examples section */}
              {selectedTag && (
                <div className="mt-4 border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      <code>&lt;{selectedTag}&gt;</code> Examples
                    </h4>
                    <Badge>
                      {htmlStructure.tag_counts[selectedTag]} occurrences
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {getTagExamples(selectedTag).map((example, i) => (
                      <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="font-mono text-xs mb-1 opacity-80">
                          {example.path}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {example.classes.map((cls, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="text-xs"
                            >
                              .{cls}
                            </Badge>
                          ))}
                        </div>

                        {/* New section to display the actual text content */}
                        <div className="mt-2 border-t pt-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Content:
                          </div>
                          <div className="bg-white/40 p-1.5 rounded text-sm overflow-auto max-h-[100px]">
                            {example.text}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {example.text_length}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  downloadJson(
                    htmlStructure.tag_counts,
                    "tag-distribution.json"
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" /> Download Full Tag
                Distribution
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CSS Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" /> CSS Classes
            </CardTitle>
            <CardDescription>Most used CSS classes on the page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {htmlStructure.class_counts &&
              Object.keys(htmlStructure.class_counts).length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(htmlStructure.class_counts)
                      .slice(0, 20)
                      .map(([className, count]) => (
                        <Button
                          key={className}
                          variant={
                            selectedClass === className ? "default" : "outline"
                          }
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() =>
                            setSelectedClass(
                              selectedClass === className ? null : className
                            )
                          }
                        >
                          <span>.{className}</span>
                          <Badge variant="secondary" className="ml-1">
                            {count}
                          </Badge>
                        </Button>
                      ))}
                  </div>

                  {selectedClass &&
                    htmlStructure.class_to_elements &&
                    htmlStructure.class_to_elements[selectedClass] && (
                      <div className="mt-4 border rounded-md p-3">
                        <h4 className="font-medium mb-2 flex items-center justify-between">
                          <span>
                            Class: <code>.{selectedClass}</code>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClass(null)}
                          >
                            Close
                          </Button>
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">
                              Used on tags:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {htmlStructure.class_to_elements[
                                selectedClass
                              ].tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                  &lt;{tag}&gt;
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2 flex justify-between">
                              <span>Element examples:</span>
                              <Badge>
                                {
                                  htmlStructure.class_to_elements[selectedClass]
                                    .count
                                }{" "}
                                occurrences
                              </Badge>
                            </div>
                            <div className="space-y-1 font-mono text-xs max-h-[300px] overflow-y-auto">
                              {htmlStructure.class_to_elements[
                                selectedClass
                              ].sample_elements.map((el, i) => (
                                <Accordion
                                  key={i}
                                  type="single"
                                  collapsible
                                  className="w-full"
                                >
                                  <AccordionItem
                                    value={`el-${i}`}
                                    className="border rounded"
                                  >
                                    <AccordionTrigger className="p-2 hover:bg-muted/50 rounded text-xs">
                                      &lt;{el.tag}
                                      {el.id && ` id="${el.id}"`}
                                      {el.classes &&
                                        ` class="${el.classes.join(" ")}"`}
                                      &gt;
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      {/* Find and show matching element from element_tree with content */}
                                      {filteredData?.element_tree
                                        ?.filter(
                                          (elem) =>
                                            elem.tag === el.tag &&
                                            elem.classes.includes(
                                              selectedClass
                                            ) &&
                                            (el.id ? elem.id === el.id : true)
                                        )
                                        .slice(0, 1)
                                        .map((match, j) => (
                                          <div
                                            key={j}
                                            className="p-2 bg-muted text-xs"
                                          >
                                            <div className="mb-1 opacity-70">
                                              Path: {match.path}
                                            </div>
                                            <div className="mb-1">
                                              Children: {match.children_count}
                                            </div>
                                            {match.text_length > 0 && (
                                              <>
                                                <div className="mb-1">
                                                  Text length: ~
                                                  {match.text_length} characters
                                                </div>
                                                {/* Add content display */}
                                                <div className="mb-2">
                                                  <div className="font-medium mt-1 mb-1">
                                                    Content:
                                                  </div>
                                                  <div className="bg-white/40 p-1.5 rounded overflow-auto max-h-[100px]">
                                                    {match.text_content ||
                                                      "No content available"}
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                            {Object.keys(match.attributes)
                                              .length > 0 && (
                                              <div>
                                                <div className="font-medium mt-1">
                                                  Other attributes:
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                  {Object.entries(
                                                    match.attributes
                                                  ).map(([key, val], k) => (
                                                    <div key={k}>
                                                      <span className="text-muted-foreground">
                                                        {key}=
                                                      </span>
                                                      <span>
                                                        &quot;
                                                        {val.substring(0, 20)}
                                                        {val.length > 20
                                                          ? "..."
                                                          : ""}
                                                        &quot;
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadJson(
                        htmlStructure.class_counts,
                        "css-classes.json"
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" /> Download All CSS
                    Classes
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No CSS classes found on the page
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* IDs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" /> Element IDs
            </CardTitle>
            <CardDescription>HTML element IDs used on the page</CardDescription>
          </CardHeader>
          <CardContent>
            {htmlStructure.id_counts &&
            Object.keys(htmlStructure.id_counts).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(htmlStructure.id_counts).map(([id, count]) => (
                  <Badge key={id} variant="outline" className="px-2 py-1">
                    #{id}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No IDs found on the page</p>
            )}
          </CardContent>
        </Card>

        {/* Semantic elements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Semantic Structure
            </CardTitle>
            <CardDescription>
              Semantic HTML elements used on the page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(htmlStructure.semantic_elements || {})
                .filter(([_, count]) => count > 0)
                .map(([tag, count]) => (
                  <div
                    key={tag}
                    className="flex justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <code className="text-sm">&lt;{tag}&gt;</code>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
            </div>

            {(!htmlStructure.semantic_elements ||
              !Object.values(htmlStructure.semantic_elements).some(
                (count) => count > 0
              )) && (
              <p className="text-muted-foreground">
                No semantic elements found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Forms */}
        {data?.forms && data.forms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FormInput className="h-5 w-5" /> Forms
              </CardTitle>
              <CardDescription>Forms detected on the page</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {data.forms.map((form, i) => (
                  <AccordionItem key={i} value={`form-${i}`}>
                    <AccordionTrigger>
                      Form {i + 1}: {form.method?.toUpperCase()}{" "}
                      {form.action ? `to ${form.action}` : "(no action)"}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-3 gap-2 font-medium border-b pb-1">
                          <div>Type</div>
                          <div>Name</div>
                          <div>Required</div>
                        </div>
                        {form.inputs?.map((input, j) => (
                          <div key={j} className="grid grid-cols-3 gap-2">
                            <div>
                              {input.tag === "input"
                                ? `${input.tag}[${input.type || "text"}]`
                                : input.tag}
                            </div>
                            <div>{input.name || "-"}</div>
                            <div>{input.required ? "Yes" : "No"}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  function renderDomExplorer(data) {
    const elementTree = data?.element_tree || [];

    if (!elementTree.length) {
      return (
        <p className="text-muted-foreground">No DOM structure data available</p>
      );
    }

    const commonTags = [
      "div",
      "span",
      "p",
      "a",
      "img",
      "h1",
      "h2",
      "h3",
      "ul",
      "li",
      "button",
      "input",
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" /> Filter by Tag
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-[400px] overflow-auto"
              >
                <DropdownMenuLabel>Common Tags</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setDomFilterType("all")}>
                  All Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {commonTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => setDomFilterType(tag)}
                  >
                    &lt;{tag}&gt;
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setDomFilterType("all");
                    setDomSearchTerm("");
                  }}
                >
                  Clear All Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {domFilterType !== "all" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDomFilterType("all")}
              >
                &lt;{domFilterType}&gt; <span className="ml-1">×</span>
              </Button>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search DOM elements..."
              className="pl-9 w-full"
              value={domSearchTerm}
              onChange={(e) => setDomSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" /> DOM Structure
              </div>
              <Badge>{filteredData?.element_tree?.length || 0} elements</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] rounded-md border">
              <div className="p-4">
                {filteredData?.element_tree?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Element</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Attributes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.element_tree.map((element, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-mono">
                            &lt;{element.tag}&gt;
                          </TableCell>
                          <TableCell>
                            <div className="max-w-sm overflow-hidden text-ellipsis font-mono text-xs">
                              {element.path}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {element.classes?.map((cls, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs px-1 py-0 h-auto"
                                >
                                  .{cls}
                                </Badge>
                              ))}
                              {element.id && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-1 py-0 h-auto"
                                >
                                  #{element.id}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-y-1">
                              {Object.entries(element.attributes || {}).map(
                                ([key, value], i) => (
                                  <div key={i} className="mr-2 text-xs">
                                    <span className="text-muted-foreground">
                                      {key}=
                                    </span>
                                    <span className="font-mono">
                                      &quot;{value}&quot;
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <span>{element.children_count} children</span>
                              {element.text_length > 0 && (
                                <span>• {element.text_length} chars</span>
                              )}
                              <span>• depth {element.depth}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No elements match your search criteria
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderCssSection(data) {
    const cssInfo = data?.css_info;

    if (!cssInfo) {
      return <p className="text-muted-foreground">No CSS data available</p>;
    }

    return (
      <div className="space-y-6">
        {/* CSS Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" /> CSS Stylesheets
            </CardTitle>
            <CardDescription>
              External CSS files loaded by the page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cssInfo.stylesheets && cssInfo.stylesheets.length > 0 ? (
              <div className="space-y-2">
                {cssInfo.stylesheets.map((stylesheet, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="font-mono text-sm truncate max-w-[70%]">
                      {stylesheet.href}
                    </div>
                    <Badge variant="outline">{stylesheet.media}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No external stylesheets found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Inline styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" /> Inline Styles
            </CardTitle>
            <CardDescription>
              CSS styles defined within the document
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cssInfo.inline_styles && cssInfo.inline_styles.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {cssInfo.inline_styles.map((style, index) => (
                  <AccordionItem key={index} value={`style-${index}`}>
                    <AccordionTrigger>
                      Inline Style {index + 1}{" "}
                      {style.media !== "all" ? `(${style.media})` : ""}
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-muted/50 p-3 rounded-lg overflow-x-auto font-mono text-xs">
                        {style.content || "Empty style tag"}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">No inline styles found</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderHeadingsSection = (headings) => {
    if (!headings?.length)
      return <p className="text-muted-foreground">No headings found</p>;

    return (
      <div className="space-y-6">
        {/* Heading level distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heading className="h-5 w-5" /> Heading Distribution
            </CardTitle>
            <CardDescription>Distribution of headings by level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["h1", "h2", "h3", "h4", "h5", "h6"].map((level) => {
                const count = headings.filter((h) => h.level === level).length;
                const percentage =
                  Math.round((count / headings.length) * 100) || 0;

                return count > 0 ? (
                  <div key={level} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="font-medium">{level.toUpperCase()}</div>
                      <div>
                        {count} ({percentage}%)
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Headings list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">
              Headings ({headings?.length})
            </h4>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by level</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSearchTerm("h1")}>
                    H1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("h2")}>
                    H2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchTerm("h3")}>
                    H3
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSearchTerm("")}>
                    Clear filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(headings)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Level</TableHead>
                <TableHead>Text</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headings?.map((heading, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge
                      variant={
                        heading?.level === "h1"
                          ? "default"
                          : heading?.level === "h2"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {heading?.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{heading?.text}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderLinksTable = (links) => {
    if (!links?.length)
      return <p className="text-muted-foreground">No links found</p>;

    // Count different link types
    const externalCount = links.filter((link) => link.is_external).length;
    const internalCount = links.length - externalCount;

    return (
      <div className="space-y-6">
        {/* Link type distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" /> Link Distribution
            </CardTitle>
            <CardDescription>
              Distribution of internal vs external links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{internalCount}</div>
                <div className="text-muted-foreground">Internal Links</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">{externalCount}</div>
                <div className="text-muted-foreground">External Links</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Links ({links?.length})</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(links)}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson(links, "links.json")}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-[100px] text-center">Type</TableHead>
                  <TableHead className="w-[80px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links?.map((link, index) => (
                  <TableRow key={index}>
                    <TableCell>{link?.text || "No text"}</TableCell>
                    <TableCell className="font-mono text-sm truncate max-w-xs">
                      {link?.href}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={link?.is_external ? "outline" : "secondary"}
                      >
                        {link?.is_external ? "External" : "Internal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={link?.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  const renderImagesGrid = (images) => {
    if (!images?.length)
      return <p className="text-muted-foreground">No images found</p>;

    return (
      <div className="space-y-6">
        {/* Image stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Images Overview
            </CardTitle>
            <CardDescription>Overview of images on the page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">
                  {
                    images.filter((img) => img.alt && img.alt !== "No alt text")
                      .length
                  }
                </div>
                <div className="text-muted-foreground">
                  Images with alt text
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <div className="text-2xl font-bold">
                  {
                    images.filter(
                      (img) => !img.alt || img.alt === "No alt text"
                    ).length
                  }
                </div>
                <div className="text-muted-foreground">
                  Images missing alt text
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Images ({images?.length})</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadJson(images, "images.json")}
            >
              <Download className="w-4 h-4 mr-2" /> Export List
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images?.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="bg-muted/50 rounded-md p-2 flex items-center justify-center h-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex flex-col gap-1"
                      asChild
                    >
                      <a
                        href={image?.src}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-5 w-5" />
                        <span className="text-xs">View Image</span>
                      </a>
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <div className="font-medium">Alt Text</div>
                      {!image?.alt || image?.alt === "No alt text" ? (
                        <Badge variant="destructive" className="text-xs">
                          Missing
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Present
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm truncate">
                      {image?.alt || "No alt text"}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {image?.src}
                    </div>
                    {(image?.width || image?.height) && (
                      <div className="text-xs text-muted-foreground">
                        Dimensions: {image?.width || "?"} ×{" "}
                        {image?.height || "?"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              {results?.type === "api" ? (
                <Code className="h-5 w-5" />
              ) : (
                <Globe className="h-5 w-5" />
              )}
              Scraping Results
            </CardTitle>
            <CardDescription className="mt-1">
              Data extracted from{" "}
              <Badge
                variant={results?.type === "api" ? "secondary" : "default"}
              >
                {results?.type === "api" ? "API endpoint" : "website"}
              </Badge>
            </CardDescription>
          </div>

          {results?.success && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadJson(results, "scraping-results.json")}
            >
              <Download className="w-4 h-4 mr-2" /> Download All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!results?.success && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {results?.error || "An unknown error occurred"}
            </AlertDescription>
          </Alert>
        )}

        {results?.success &&
          (results.type === "api"
            ? renderApiResults(filteredData)
            : renderWebResults(filteredData))}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
