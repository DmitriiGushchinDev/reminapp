import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Template } from "@/types";

interface TemplateManagerModalProps {
  templates: Template[];
  onTemplateCreate: (template: Omit<Template, "id">) => void;
  onTemplateUpdate: (id: string, template: Partial<Template>) => void;
  onTemplateDelete: (id: string) => void;
  trigger?: React.ReactNode;
}

export function TemplateManagerModal({
  templates,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  trigger
}: TemplateManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: ""
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? [...new Set(matches.map(match => match.slice(1, -1)))] : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.content) return;

    const variables = extractVariables(formData.content);

    if (editingTemplate) {
      onTemplateUpdate(editingTemplate.id, {
        name: formData.name,
        content: formData.content,
        variables
      });
    } else {
      onTemplateCreate({
        name: formData.name,
        content: formData.content,
        variables
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", content: "" });
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      onTemplateDelete(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Manager</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter template content. Use {clientName}, {service}, {time} for variables."
                    className="min-h-24"
                    required
                  />
                  <div className="text-xs text-muted-foreground">
                    Available variables: {'{clientName}, {service}, {time}'}
                  </div>
                </div>

                {formData.content && (
                  <div className="space-y-2">
                    <Label>Detected Variables</Label>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(formData.content).map((variable) => (
                        <Badge key={variable} variant="outline">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {editingTemplate && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" className="bg-primary hover:bg-primary-hover">
                    {editingTemplate ? "Update" : "Create"} Template
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.content}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
