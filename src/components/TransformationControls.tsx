import {
  Badge,
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ansospace/ui";
import { Info } from "lucide-react";

import { EmotionalTone, TransformationOptions } from "@/core/entities/transformation";

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
            <Label>Creativity Level</Label>
            <Tooltip>
              <TooltipTrigger render={<Info className="size-4 cursor-help text-gray-400 hover:text-gray-600" />} />
              <TooltipContent>
                <p>Higher creativity allows more varied word choices</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Badge variant="secondary">{Math.round(options.creativity * 100)}%</Badge>
        </div>
        <Slider
          id="creativity-slider"
          value={[options.creativity]}
          onValueChange={(value) => onChange({ ...options, creativity: value as number })}
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
            <Label>Context Preservation</Label>
            <Tooltip>
              <TooltipTrigger render={<Info className="size-4 cursor-help text-gray-400 hover:text-gray-600" />} />
              <TooltipContent>
                <p>Higher values maintain more original meaning</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Badge variant="secondary">{Math.round(options.contextPreservation * 100)}%</Badge>
        </div>
        <Slider
          id="context-slider"
          value={[options.contextPreservation]}
          onValueChange={(value) => onChange({ ...options, contextPreservation: value as number })}
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
            <Label>Emotional Tone</Label>
            <Tooltip>
              <TooltipTrigger render={<Info className="size-4 cursor-help text-gray-400 hover:text-gray-600" />} />
              <TooltipContent>
                <p>Adjust the emotional tone of the text</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={options.emotionalTone}
            onValueChange={(value) => onChange({ ...options, emotionalTone: value as EmotionalTone })}
            disabled={disabled}
          >
            <SelectTrigger id="emotional-tone-select" className="w-[120px]">
              <SelectValue />
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
      </div>

      {/* Formality */}
      <div className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Formality</Label>
            <Tooltip>
              <TooltipTrigger render={<Info className="size-4 cursor-help text-gray-400 hover:text-gray-600" />} />
              <TooltipContent>
                <p>Choose between formal and informal language</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={options.formality}
            disabled={disabled}
            onValueChange={(value) => onChange({ ...options, formality: value as "formal" | "informal" })}
          >
            <SelectTrigger id="formality-select" className="w-[120px]">
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
          <Label>Preserve Intent</Label>
          <Tooltip>
            <TooltipTrigger render={<Info className="size-4 cursor-help text-gray-400 hover:text-gray-600" />} />
            <TooltipContent>
              <p>Maintain the original meaning while transforming</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="preserve-intent-switch"
          checked={options.preserveIntent}
          onCheckedChange={(checked) => onChange({ ...options, preserveIntent: checked })}
          disabled={disabled}
        />
      </div>
    </Card>
  );
};
