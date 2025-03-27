/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  Code,
  Table as TableIcon,
  BarChart,
  List,
  FileJson,
  Search,
  ChevronDown,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const APIResponseDisplay = ({ data, analytics }) => {
  const [viewMode, setViewMode] = useState("json");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedText, setExpandedText] = useState({});
  const [filteredData, setFilteredData] = useState(data);
  const [uniqueValueStats, setUniqueValueStats] = useState({});
  const [columnWidths, setColumnWidths] = useState({});

  // Apply search filtering
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    if (Array.isArray(data)) {
      const filtered = data.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchLower)
      );
      setFilteredData(filtered);
    } else if (typeof data === "object" && data !== null) {
      // For objects, we'll filter the keys that match
      const filtered = {};
      Object.entries(data).forEach(([key, value]) => {
        if (
          key.toLowerCase().includes(searchLower) ||
          JSON.stringify(value).toLowerCase().includes(searchLower)
        ) {
          filtered[key] = value;
        }
      });
      setFilteredData(filtered);
    } else {
      // For primitive types
      if (String(data).toLowerCase().includes(searchLower)) {
        setFilteredData(data);
      } else {
        setFilteredData(null);
      }
    }
  }, [searchTerm, data]);

  // Find unique values and calculate statistics for each column
  const analyzeUniqueValues = useCallback(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const stats = {};
    const allKeys = Array.from(
      new Set(data.flatMap((item) => Object.keys(item)))
    );

    allKeys.forEach((key) => {
      // Get all values for this key
      const allValues = data
        .map((item) => item[key])
        .filter((val) => val !== undefined);

      // Count occurrences of each value
      const valueCounts = {};
      allValues.forEach((val) => {
        const valueStr =
          typeof val === "object" ? JSON.stringify(val) : String(val);
        valueCounts[valueStr] = (valueCounts[valueStr] || 0) + 1;
      });

      // Calculate unique value count
      const uniqueCount = Object.keys(valueCounts).length;

      // Find most common value
      let mostCommon = null;
      let maxCount = 0;
      Object.entries(valueCounts).forEach(([val, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = val;
        }
      });

      // Store stats
      stats[key] = {
        total: allValues.length,
        uniqueCount,
        uniquePercentage:
          Math.round((uniqueCount / allValues.length) * 100) || 0,
        mostCommon: mostCommon,
        mostCommonCount: maxCount,
        mostCommonPercentage:
          Math.round((maxCount / allValues.length) * 100) || 0,
        isEmpty: allValues.length === 0,
        isAllSame: uniqueCount === 1 && allValues.length > 0,
        isAllUnique: uniqueCount === allValues.length && allValues.length > 0,
      };
    });

    setUniqueValueStats(stats);

    // Set column widths based on content
   const widths = {};
   allKeys.forEach((key) => {
     // Calculate average string length of values in this column
     const values = data.map((item) =>
       item[key] === undefined
         ? ""
         : typeof item[key] === "object"
         ? JSON.stringify(item[key])
         : String(item[key])
     );

     const avgLength =
       values.reduce((sum, val) => sum + val.length, 0) / values.length;

     // More balanced width calculation
     if (avgLength < 10) {
       widths[key] = 100; // Minimum width
     } else if (avgLength < 30) {
       widths[key] = Math.max(100, avgLength * 6); // Moderate growth
     } else if (avgLength < 80) {
       widths[key] = Math.max(180, avgLength * 4); // Slower growth
     } else {
       widths[key] = 320; // Maximum width
     }
   });

    setColumnWidths(widths);
  }, [data]);
  
  // Analyze unique values when data changes or view mode changes
  useEffect(() => {
    if (viewMode === "table" && Array.isArray(data)) {
      analyzeUniqueValues();
    }
  }, [analyzeUniqueValues, data, viewMode]);

  // Toggle text expansion for table cells
  const toggleTextExpansion = (rowIndex, key) => {
    setExpandedText((prev) => {
      const id = `${rowIndex}-${key}`;
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(
      typeof content === "object" ? JSON.stringify(content, null, 2) : content
    );
  };

  const downloadJson = (data, filename = "api-response.json") => {
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

  // Function to determine if data is suitable for table view
  const canShowAsTable = () => {
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      const firstItem = filteredData[0];
      return typeof firstItem === "object" && !Array.isArray(firstItem);
    }
    return false;
  };

  // Function to determine if object can be rendered as a flat key-value pairs
  const isObjectFlattable = (obj) => {
    if (!obj || typeof obj !== "object") return false;

    return Object.values(obj).every(
      (val) => typeof val !== "object" || val === null
    );
  };

  // Function to render a flattened object as a table
  const renderFlatObject = (obj) => {
    if (!obj) return null;

    return (
      <div className="border rounded-md">
        <div className="overflow-x-auto" style={{ maxHeight: "500px" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-xs font-medium text-muted-foreground w-[200px]">
                  Key
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(obj).map(([key, value], index) => (
                <tr key={key} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{key}</td>
                  <td className="p-3">
                    {/* Value rendering remains the same */}
                    {value === null ? (
                      <span className="text-muted-foreground">null</span>
                    ) : value === "" ? (
                      <span className="text-muted-foreground italic">
                        empty string
                      </span>
                    ) : typeof value === "boolean" ? (
                      <Badge variant={value ? "default" : "outline"}>
                        {value.toString()}
                      </Badge>
                    ) : typeof value === "string" && value.length > 50 ? (
                      <div>
                        {expandedText[`flat-${index}`] ? (
                          <>
                            <div className="whitespace-pre-wrap font-mono text-sm">
                              {value}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => toggleTextExpansion(`flat`, index)}
                            >
                              Show Less
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="font-mono text-sm">
                              {value.substring(0, 50)}...
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => toggleTextExpansion(`flat`, index)}
                            >
                              Show More ({value.length} chars)
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-sm">{String(value)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Function to render array of objects as a table
  const renderTableView = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          No data to display
        </div>
      );
    }

    // Get all unique keys from all objects
    const allKeys = Array.from(
      new Set(filteredData.flatMap((item) => Object.keys(item)))
    );

    return (
      <>
        {/* Add stats bar above table */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">
            {filteredData.length} {filteredData.length === 1 ? "row" : "rows"}
          </Badge>
          <Badge variant="outline">
            {allKeys.length} {allKeys.length === 1 ? "column" : "columns"}
          </Badge>
        </div>

        {/* Use a div with max-width to force horizontal scrolling */}
        <div className="border rounded-md">
          {/* This div with overflow-x-auto ensures horizontal scrolling works */}
          <div className="overflow-x-auto" style={{ maxHeight: "500px" }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b">
                  {allKeys.map((key) => (
                    <th
                      key={key}
                      className="p-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      style={{ minWidth: columnWidths[key] || 150 }}
                    >
                      <div className="flex items-center gap-1">
                        {key}

                        {uniqueValueStats[key] && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                >
                                  <Fingerprint className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="p-2">
                                <div className="space-y-1 text-xs">
                                  <p>
                                    <span className="font-medium">
                                      Unique values:
                                    </span>{" "}
                                    {uniqueValueStats[key].uniqueCount} of{" "}
                                    {uniqueValueStats[key].total} (
                                    {uniqueValueStats[key].uniquePercentage}%)
                                  </p>
                                  {uniqueValueStats[key].isAllUnique && (
                                    <p className="text-green-500">
                                      All values are unique
                                    </p>
                                  )}
                                  {uniqueValueStats[key].isAllSame && (
                                    <p className="text-blue-500">
                                      All values are the same
                                    </p>
                                  )}
                                  {!uniqueValueStats[key].isEmpty &&
                                    !uniqueValueStats[key].isAllUnique && (
                                      <p>
                                        <span className="font-medium">
                                          Most common value:
                                        </span>{" "}
                                        {uniqueValueStats[key].mostCommon} (
                                        {uniqueValueStats[key].mostCommonCount}{" "}
                                        times)
                                      </p>
                                    )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    {allKeys.map((key) => (
                      <td key={key} className="p-3 align-top">
                        {item[key] === undefined ? (
                          <span className="text-muted-foreground">—</span>
                        ) : item[key] === null ? (
                          <span className="text-muted-foreground">null</span>
                        ) : typeof item[key] === "object" ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Badge variant="outline">
                                  {Array.isArray(item[key])
                                    ? `Array[${item[key].length}]`
                                    : "Object"}
                                </Badge>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <pre className="text-xs overflow-auto max-h-[300px]">
                                {JSON.stringify(item[key], null, 2)}
                              </pre>
                            </PopoverContent>
                          </Popover>
                        ) : typeof item[key] === "boolean" ? (
                          <Badge variant={item[key] ? "default" : "outline"}>
                            {item[key].toString()}
                          </Badge>
                        ) : typeof item[key] === "string" &&
                          item[key].length > 50 ? (
                          <div>
                            {expandedText[`${index}-${key}`] ? (
                              <>
                                <div className="whitespace-pre-wrap font-mono text-xs">
                                  {item[key]}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-7 text-xs px-2"
                                  onClick={() =>
                                    toggleTextExpansion(index, key)
                                  }
                                >
                                  <ChevronDown className="h-4 w-4 mr-1" /> Show
                                  Less
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="font-mono text-xs">
                                  {item[key].substring(0, 50)}
                                  <span className="text-muted-foreground">
                                    ...
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-7 text-xs px-2"
                                  onClick={() =>
                                    toggleTextExpansion(index, key)
                                  }
                                >
                                  <ChevronRight className="h-4 w-4 mr-1" />
                                  Show All ({item[key].length} chars)
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-xs">
                            {String(item[key])}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  // Function to render tree view of complex data
  const renderTreeView = (obj, depth = 0) => {
    const indent = depth * 20;

    if (obj === null) {
      return (
        <div style={{ marginLeft: indent }} className="text-muted-foreground">
          null
        </div>
      );
    }

    if (Array.isArray(obj)) {
      return (
        <div style={{ marginLeft: depth > 0 ? indent : 0 }}>
          <div className="flex items-center gap-1 text-sm font-medium mb-1">
            <span className="text-primary">Array</span>
            <Badge variant="outline" className="text-xs">
              {obj.length} items
            </Badge>
          </div>
          <div className="pl-4 border-l border-gray-200 dark:border-gray-800">
            {obj.slice(0, 50).map((item, index) => (
              <div key={index} className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">
                  {index}:
                </div>
                {typeof item === "object" && item !== null ? (
                  renderTreeView(item, depth + 1)
                ) : (
                  <div className="pl-2 font-mono text-sm">
                    {renderPrimitiveValue(item)}
                  </div>
                )}
              </div>
            ))}
            {obj.length > 50 && (
              <div className="text-muted-foreground italic pl-2">
                ...{obj.length - 50} more items
              </div>
            )}
          </div>
        </div>
      );
    }

    if (typeof obj === "object") {
      return (
        <div style={{ marginLeft: depth > 0 ? indent : 0 }}>
          {depth > 0 && (
            <div className="flex items-center gap-1 text-sm font-medium mb-1">
              <span className="text-primary">Object</span>
              <Badge variant="outline" className="text-xs">
                {Object.keys(obj).length} properties
              </Badge>
            </div>
          )}
          <div
            className={
              depth > 0
                ? "pl-4 border-l border-gray-200 dark:border-gray-800"
                : ""
            }
          >
            {Object.entries(obj).map(([key, value]) => (
              <div key={key} className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">{key}:</div>
                {typeof value === "object" && value !== null ? (
                  renderTreeView(value, depth + 1)
                ) : (
                  <div className="pl-2 font-mono text-sm">
                    {renderPrimitiveValue(value)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div style={{ marginLeft: indent }}>{String(obj)}</div>;
  };

  const renderPrimitiveValue = (value) => {
    if (typeof value === "string") {
      return (
        <span className="text-green-600 dark:text-green-400">
          &quot;{value}&quot;
        </span>
      );
    } else if (typeof value === "number") {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    } else if (typeof value === "boolean") {
      return (
        <span className="text-purple-600 dark:text-purple-400">
          {value.toString()}
        </span>
      );
    } else if (value === null) {
      return <span className="text-gray-500 dark:text-gray-400">null</span>;
    } else if (value === undefined) {
      return (
        <span className="text-gray-500 dark:text-gray-400">undefined</span>
      );
    }
    return String(value);
  };

  // Function to render analytics summary
  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5" /> API Response Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Status Code</div>
              <div className="font-mono text-lg">
                {analytics.status_code}
                <Badge
                  className="ml-2"
                  variant={
                    analytics.status_code >= 400
                      ? "destructive"
                      : analytics.status_code >= 300
                      ? "secondary"
                      : "default"
                  }
                >
                  {analytics.status_code < 300
                    ? "OK"
                    : analytics.status_code < 400
                    ? "Redirect"
                    : "Error"}
                </Badge>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Content Type</div>
              <div className="font-mono">
                {analytics.content_type?.split(";")[0] || "Unknown"}
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">Response Size</div>
              <div className="font-mono">
                {Math.round(analytics.response_size_bytes / 1024)} KB
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm text-muted-foreground">
                Processing Time
              </div>
              <div className="font-mono">
                {analytics.processing_time_seconds} seconds
              </div>
            </div>
            {analytics.is_json && (
              <>
                {analytics.structure &&
                  analytics.structure.type === "object" && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Object Properties
                      </div>
                      <div className="font-mono">
                        {analytics.structure.keys_count}
                      </div>
                    </div>
                  )}
                {analytics.structure &&
                  analytics.structure.type === "array" && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">
                        Array Items
                      </div>
                      <div className="font-mono">
                        {analytics.structure.items_count}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderAnalytics()}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-medium">API Response</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in response..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(data)}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => downloadJson(data, "api-response.json")}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList>
          <TabsTrigger value="json">
            <Code className="h-4 w-4 mr-2" />
            JSON
          </TabsTrigger>

          {canShowAsTable() && (
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          )}

          {isObjectFlattable(filteredData) && !Array.isArray(filteredData) && (
            <TabsTrigger value="flat">
              <List className="h-4 w-4 mr-2" />
              Key-Value
            </TabsTrigger>
          )}

          <TabsTrigger value="tree">
            <BarChart className="h-4 w-4 mr-2" />
            Tree View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="mt-4">
          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto border">
            {JSON.stringify(filteredData, null, 2)}
          </pre>
        </TabsContent>

        {canShowAsTable() && (
          <TabsContent value="table" className="mt-4">
            {renderTableView()}
          </TabsContent>
        )}

        {isObjectFlattable(filteredData) && !Array.isArray(filteredData) && (
          <TabsContent value="flat" className="mt-4">
            {renderFlatObject(filteredData)}
          </TabsContent>
        )}

        <TabsContent value="tree" className="mt-4">
          <div className="bg-muted/50 p-4 rounded-lg border overflow-auto max-h-[500px]">
            {renderTreeView(filteredData)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIResponseDisplay;