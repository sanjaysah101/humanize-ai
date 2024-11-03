import { EmotionalTone, TransformationOptions } from "@/core/entities/transformation";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { InfoTooltip } from "./ui/info-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

interface TransformationControlsProps {
  options: TransformationOptions;
  onChange: (options: TransformationOptions) => void;
  disabled?: boolean;
}

export const TransformationControls = ({ options, onChange, disabled }: TransformationControlsProps) => {
  return (
    <Card className="divide-y border-2 p-6">
      {/* Creativity Level */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Creativity Level</label>
            <InfoTooltip content="Higher creativity allows more varied word choices" />
          </div>
          <Badge variant="secondary">{Math.round(options.creativity * 100)}%</Badge>
        </div>
        <Slider
          value={[options.creativity]}
          onValueChange={([value]) => onChange({ ...options, creativity: value })}
          min={0}
          max={1}
          step={0.1}
          disabled={disabled}
        />
      </div>

      {/* Context Preservation */}
      <div className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Context Preservation</label>
            <InfoTooltip content="Higher values maintain more original meaning" />
          </div>
          <Badge variant="secondary">{Math.round(options.contextPreservation * 100)}%</Badge>
        </div>
        <Slider
          value={[options.contextPreservation]}
          onValueChange={([value]) => onChange({ ...options, contextPreservation: value })}
          min={0.5}
          max={1}
          step={0.1}
          disabled={disabled}
        />
      </div>

      {/* Emotional Tone */}
      <div className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Emotional Tone</label>
            <InfoTooltip content="Adjust the emotional tone of the text" />
          </div>
        </div>
        <Select
          value={options.emotionalTone}
          onValueChange={(value: EmotionalTone) => onChange({ ...options, emotionalTone: value })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Formality */}
      <div className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Formality</label>
            <InfoTooltip content="Choose between formal and informal language" />
          </div>
          <Select
            value={options.formality}
            disabled={disabled}
            onValueChange={(value: "formal" | "informal") => onChange({ ...options, formality: value })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="informal">Informal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preserve Intent */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Preserve Intent</label>
          <InfoTooltip content="Maintain the original meaning while transforming" />
        </div>
        <Switch
          checked={options.preserveIntent}
          onCheckedChange={(checked) => onChange({ ...options, preserveIntent: checked })}
          disabled={disabled}
        />
      </div>
    </Card>
  );
};
