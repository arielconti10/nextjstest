"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Wand2,
  Zap,
  Grip,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Rule {
  id: string;
  conditions: Condition[];
  replacement: string;
  matchType: "all" | "any"; // all = AND, any = OR
}

type FieldType = "text" | "number";

interface FormulaField {
  value: string;
  label: string;
  type: FieldType;
  description?: string;
  example?: string;
}

interface FormulaFunction {
  name: string;
  description: string;
  syntax: string;
  example: string;
  arguments?: {
    name: string;
    type: string;
    description: string;
  }[];
}

const OPERATORS: Record<FieldType, { value: string; label: string }[]> = {
  text: [
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "starts_with", label: "Starts with" },
    { value: "ends_with", label: "Ends with" },
    { value: "regex", label: "Matches regex" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "not_equals", label: "≠" },
    { value: "greater_than", label: ">" },
    { value: "less_than", label: "<" },
    { value: "greater_than_equals", label: "≥" },
    { value: "less_than_equals", label: "≤" },
    { value: "between", label: "Between" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" },
  ],
};

const AVAILABLE_FIELDS: FormulaField[] = [
  {
    value: "company_name",
    label: "Company Name",
    type: "text",
    description: "The official name of the company",
    example: "Acme Corp",
  },
  {
    value: "email",
    label: "Email",
    type: "text",
    description: "The email address of the company",
  },
  {
    value: "revenue",
    label: "Revenue",
    type: "number",
    description: "The total revenue of the company",
  },
  {
    value: "employees",
    label: "Number of Employees",
    type: "number",
    description: "The total number of employees",
  },
  {
    value: "industry",
    label: "Industry",
    type: "text",
    description: "The industry the company belongs to",
  },
  {
    value: "country",
    label: "Country",
    type: "text",
    description: "The country the company is located in",
  },
];

const FORMULA_FUNCTIONS: FormulaFunction[] = [
  {
    name: "SUM",
    description: "Adds up all values in the specified column",
    syntax: "SUM([Column])",
    example: "SUM([Revenue])",
  },
  {
    name: "AVG",
    description: "Calculates the average of values in the specified column",
    syntax: "AVG([Column])",
    example: "AVG([Price])",
  },
  {
    name: "COUNT",
    description: "Counts the number of non-empty values",
    syntax: "COUNT([Column])",
    example: "COUNT([Orders])",
  },
  {
    name: "MIN",
    description: "Finds the minimum value in the specified column",
    syntax: "MIN([Column])",
    example: "MIN([Price])",
  },
  {
    name: "MAX",
    description: "Finds the maximum value in the specified column",
    syntax: "MAX([Column])",
    example: "MAX([Price])",
  },
  {
    name: "IF",
    description: "Conditional logic in formulas",
    syntax: "IF(condition, value_if_true, value_if_false)",
    example: "IF([Status]='Active', [Price] * 1.2, [Price])",
  },
];

interface FormulaValidation {
  isValid: boolean;
  error?: string;
  preview?: string;
}

const DragHandle = () => (
  <div className="flex h-full items-center px-2">
    <Grip className="h-4 w-4 text-muted-foreground" />
  </div>
);

const getFieldType = (fieldName: string): FieldType => {
  return (
    (AVAILABLE_FIELDS.find((field) => field.value === fieldName)
      ?.type as FieldType) || "text"
  );
};

const renderConditionPreview = (condition: Condition) => {
  if (!condition.field || !condition.operator) return null;

  const fieldLabel =
    AVAILABLE_FIELDS.find((f) => f.value === condition.field)?.label ||
    condition.field;
  const operatorLabel =
    OPERATORS[getFieldType(condition.field)].find(
      (op) => op.value === condition.operator
    )?.label || condition.operator;

  return (
    <span className="text-sm">
      <span className="font-medium">{fieldLabel}</span>{" "}
      <span className="text-muted-foreground">{operatorLabel}</span>{" "}
      {!["is_empty", "is_not_empty"].includes(condition.operator) && (
        <span className="font-medium">{condition.value}</span>
      )}
    </span>
  );
};

const RuleSummary = ({ rule }: { rule: Rule }) => {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="font-medium text-sm text-muted-foreground">
        {rule.conditions.length > 1
          ? `Match ${rule.matchType === "all" ? "ALL" : "ANY"} of:`
          : "When:"}
      </div>
      <ul className="mt-3 space-y-2">
        {rule.conditions.map((condition, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {index + 1}
            </div>
            {renderConditionPreview(condition)}
          </li>
        ))}
      </ul>
      {rule.replacement && (
        <div className="mt-4 border-t pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Replace with:</span>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              {rule.replacement}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const [isAutomated, setIsAutomated] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "1",
      conditions: [{ field: "", operator: "", value: "" }],
      replacement: "",
      matchType: "all",
    },
  ]);
  const [elseReplacement, setElseReplacement] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [formula, setFormula] = useState("");
  const [formulaValidation, setFormulaValidation] = useState<FormulaValidation>(
    { isValid: false }
  );
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        formulaRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: crypto.randomUUID(),
        conditions: [{ field: "", operator: "", value: "" }],
        replacement: "",
        matchType: "all",
      },
    ]);
  };

  const updateCondition = (
    ruleId: string,
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.map((condition, i) =>
                i === index ? { ...condition, [field]: value } : condition
              ),
            }
          : rule
      )
    );
  };

  const removeCondition = (ruleId: string, index: number) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: rule.conditions.filter((_, i) => i !== index),
            }
          : rule
      )
    );
  };

  const updateRule = (
    id: string,
    field: "replacement" | "matchType",
    value: string
  ) => {
    setRules(
      rules.map((rule) =>
        rule.id === id
          ? { ...rule, [field]: value as Rule[typeof field] }
          : rule
      )
    );
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const validateFormula = (formula: string): FormulaValidation => {
    if (!formula.trim()) {
      return { isValid: false };
    }

    try {
      const tokens =
        formula.match(/\[[^\]]+\]|\w+\(|\)|\+|\-|\*|\/|\d+/g) || [];
      const hasValidStructure = tokens.length > 0;
      const hasValidBrackets =
        (formula.match(/\[/g) || []).length ===
        (formula.match(/\]/g) || []).length;
      const hasValidParentheses =
        (formula.match(/\(/g) || []).length ===
        (formula.match(/\)/g) || []).length;
      const hasValidFunctions = FORMULA_FUNCTIONS.some((fn) =>
        formula.includes(fn.name)
      );
      const hasValidColumns = AVAILABLE_FIELDS.some((field) =>
        formula.includes(`[${field.label}]`)
      );

      if (!hasValidStructure || !hasValidBrackets || !hasValidParentheses) {
        return {
          isValid: false,
          error: "Invalid formula structure. Check brackets and parentheses.",
        };
      }

      let preview = formula;
      AVAILABLE_FIELDS.forEach((field) => {
        const placeholder = `[${field.label}]`;
        const sampleValue = field.type === "number" ? "100" : '"Sample"';
        preview = preview.replace(
          new RegExp(`\\${placeholder}`, "g"),
          sampleValue
        );
      });

      return {
        isValid: true,
        preview,
        ...((!hasValidFunctions || !hasValidColumns) && {
          error:
            "Warning: Formula might be incomplete. Consider using available functions and columns.",
        }),
      };
    } catch (error) {
      console.error(error);
      return {
        isValid: false,
        error: "Invalid formula syntax",
      };
    }
  };

  const formatPreview = (preview: string) => {
    return preview
      .replace(/([+\-*/])/g, " $1 ")
      .replace(/\s+/g, " ")
      .trim();
  };

  useEffect(() => {
    setFormulaValidation(validateFormula(formula));
  }, [formula]);

  const copyToFormula = (text: string) => {
    const textarea = formulaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    setFormula(value.substring(0, start) + text + value.substring(end));

    textarea.focus();
    const newCursor = start + text.length;
    textarea.setSelectionRange(newCursor, newCursor);
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormula(e.target.value);
    setHasChanges(true);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const items = Array.from(rules);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setRules(items);
    setHasChanges(true);
  };

  const addCondition = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              conditions: [
                ...rule.conditions,
                { field: "", operator: "", value: "" },
              ],
            }
          : rule
      )
    );
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
      <main className="flex-1 overflow-auto p-6">
        <Card className="w-full">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure automation rules for columns
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <Switch
                  id="automation"
                  checked={isAutomated}
                  onCheckedChange={setIsAutomated}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically populate and update this column based on the data in
              other columns
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="conditional" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conditional">
                  Conditional Automation
                </TabsTrigger>
                <TabsTrigger value="formula">Formula</TabsTrigger>
              </TabsList>
              <TabsContent value="conditional" className="space-y-6 pt-4">
                <div className="space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder="Enter a prompt that will be used to generate your automation. For example, 'If the [Company Name] has Gandalf in it, then it is Minas Tirith.'"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[100px] pr-8"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 h-6 w-6 hover:bg-muted"
                          >
                            <Wand2 className="h-4 w-4" />
                            <span className="sr-only">
                              Use AI to generate rules
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Use AI to generate rules
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="rules">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {rules.map((rule, ruleIndex) => (
                                <Draggable
                                  key={rule.id}
                                  draggableId={rule.id}
                                  index={ruleIndex}
                                >
                                  {(provided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="relative border-muted group mb-4"
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="absolute left-0 top-0 bottom-0 flex items-center cursor-grab active:cursor-grabbing"
                                      >
                                        <DragHandle />
                                      </div>
                                      <div className="pl-8">
                                        <CardHeader className="p-4 pb-0">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className="flex items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                  {ruleIndex + 1}
                                                </span>
                                                <CardTitle className="text-sm font-medium">
                                                  {ruleIndex === 0
                                                    ? "If"
                                                    : "Else if"}
                                                </CardTitle>
                                              </div>
                                              <Select
                                                value={rule.matchType}
                                                onValueChange={(value) =>
                                                  updateRule(
                                                    rule.id,
                                                    "matchType",
                                                    value
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="h-7 w-[100px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="all">
                                                    Match All
                                                  </SelectItem>
                                                  <SelectItem value="any">
                                                    Match Any
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {rules.length > 1 && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-muted"
                                                        onClick={() =>
                                                          removeRule(rule.id)
                                                        }
                                                      >
                                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="sr-only">
                                                          Remove rule
                                                        </span>
                                                      </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      Remove rule
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-4">
                                          {rule.conditions.map(
                                            (condition, index) => (
                                              <div
                                                key={index}
                                                className="relative space-y-2 rounded-lg border bg-card p-4"
                                              >
                                                <div className="flex items-start gap-3">
                                                  <Select
                                                    value={condition.field}
                                                    onValueChange={(value) =>
                                                      updateCondition(
                                                        rule.id,
                                                        index,
                                                        "field",
                                                        value
                                                      )
                                                    }
                                                  >
                                                    <SelectTrigger className="w-[180px]">
                                                      <SelectValue placeholder="Select field" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {AVAILABLE_FIELDS.map(
                                                        (field) => (
                                                          <SelectItem
                                                            key={field.value}
                                                            value={field.value}
                                                          >
                                                            {field.label}
                                                          </SelectItem>
                                                        )
                                                      )}
                                                    </SelectContent>
                                                  </Select>

                                                  {condition.field && (
                                                    <Select
                                                      value={condition.operator}
                                                      onValueChange={(value) =>
                                                        updateCondition(
                                                          rule.id,
                                                          index,
                                                          "operator",
                                                          value
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select operator" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {OPERATORS[
                                                          getFieldType(
                                                            condition.field
                                                          )
                                                        ].map((op) => (
                                                          <SelectItem
                                                            key={op.value}
                                                            value={op.value}
                                                          >
                                                            {op.label}
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  )}

                                                  {condition.field &&
                                                    condition.operator &&
                                                    ![
                                                      "is_empty",
                                                      "is_not_empty",
                                                    ].includes(
                                                      condition.operator
                                                    ) && (
                                                      <Input
                                                        placeholder="Value"
                                                        className="flex-1"
                                                        value={condition.value}
                                                        onChange={(e) =>
                                                          updateCondition(
                                                            rule.id,
                                                            index,
                                                            "value",
                                                            e.target.value
                                                          )
                                                        }
                                                        type={
                                                          getFieldType(
                                                            condition.field
                                                          ) === "number"
                                                            ? "number"
                                                            : "text"
                                                        }
                                                      />
                                                    )}

                                                  {rule.conditions.length >
                                                    1 && (
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-9 w-9"
                                                      onClick={() =>
                                                        removeCondition(
                                                          rule.id,
                                                          index
                                                        )
                                                      }
                                                    >
                                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                  )}
                                                </div>

                                                {condition.field &&
                                                  condition.operator && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                                                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                      {renderConditionPreview(
                                                        condition
                                                      )}
                                                    </div>
                                                  )}
                                              </div>
                                            )
                                          )}

                                          {rule.conditions.some(
                                            (c) => c.field && c.operator
                                          ) && <RuleSummary rule={rule} />}

                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                              addCondition(rule.id)
                                            }
                                          >
                                            <Plus className="mr-2 h-3 w-3" />
                                            Add Condition
                                          </Button>

                                          <Textarea
                                            placeholder="Replace with"
                                            value={rule.replacement}
                                            onChange={(e) =>
                                              updateRule(
                                                rule.id,
                                                "replacement",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </CardContent>
                                      </div>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addRule}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rule
                      </Button>

                      <Card className="border-muted">
                        <CardHeader className="p-4 pb-0">
                          <CardTitle className="text-sm font-medium">
                            Else
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <Textarea
                            placeholder="Default value if no conditions match"
                            value={elseReplacement}
                            onChange={(e) => {
                              setElseReplacement(e.target.value);
                              setHasChanges(true);
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="formula" className="space-y-6 pt-4">
                <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted/50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Formula Tips</p>
                          <p className="text-sm text-muted-foreground">
                            Use column names in square brackets and combine with
                            operators and functions.
                            <br />
                            Example: IF([Status]=&apos;Active&apos;, [Price] *
                            1.2, [Price])
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">
                          Available Columns
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {AVAILABLE_FIELDS.map((field) => (
                            <HoverCard key={field.value}>
                              <HoverCardTrigger asChild>
                                <Badge
                                  variant="secondary"
                                  className="cursor-help"
                                >
                                  [{field.label}]
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-60">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {field.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Type: {field.type}
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <Textarea
                          ref={formulaRef}
                          placeholder="Enter your formula. Example: IF([Status]='Active', [Price] * 1.2, [Price])"
                          className="min-h-[200px] font-mono"
                          value={formula}
                          onChange={handleFormulaChange}
                          aria-label="Formula editor"
                          aria-describedby="formula-tips"
                        />
                        {formula && (
                          <div className="absolute right-2 top-2">
                            <Badge
                              variant={
                                formulaValidation.isValid
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {formulaValidation.isValid ? "Valid" : "Invalid"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {formula && (
                      <div className="rounded-md border">
                        <div className="border-b p-3">
                          <h4 className="font-medium">Preview</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {formulaValidation.error && (
                            <p className="text-sm text-red-500">
                              {formulaValidation.error}
                            </p>
                          )}
                          {formulaValidation.preview && (
                            <div className="space-y-1.5">
                              <span className="text-sm font-medium">
                                With Sample Values:
                              </span>
                              <pre className="rounded-md bg-muted p-2 text-xs overflow-x-auto">
                                {formatPreview(formulaValidation.preview)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="border-b p-3">
                        <h3 className="font-medium">Available Functions</h3>
                      </div>
                      <div className="divide-y">
                        {FORMULA_FUNCTIONS.map((fn) => (
                          <div key={fn.name} className="p-3">
                            <h4 className="font-mono text-sm font-medium">
                              {fn.name}
                            </h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {fn.description}
                            </p>
                            <code
                              className="mt-2 block rounded bg-muted px-2 py-1 text-xs cursor-pointer hover:bg-muted/80"
                              onClick={() => copyToFormula(fn.example)}
                              title="Click to copy to formula"
                            >
                              {fn.example}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 px-6 py-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => setHasChanges(false)}>Save Changes</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
