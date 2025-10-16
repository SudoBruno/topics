import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Check, Link, Share2, Trash2 } from "lucide-react";
import { sharingService } from "@/services/sharingService";
import type { SharedTopic } from "@/types";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  hasSubtopics: boolean;
}

export function ShareDialog({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  hasSubtopics,
}: ShareDialogProps) {
  const [includeSubtopics, setIncludeSubtopics] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [existingShare, setExistingShare] = useState<SharedTopic | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExistingShare();
    }
  }, [isOpen, topicId]);

  const loadExistingShare = async () => {
    const shares = await sharingService.getTopicShares(topicId);
    if (shares.length > 0) {
      const share = shares[0];
      setExistingShare(share);
      setIsPublic(share.is_public);
      setIncludeSubtopics(share.include_subtopics);
      setShareLink(`${window.location.origin}/shared/${share.share_token}`);
    }
  };

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const share = await sharingService.createShare(
        topicId,
        isPublic,
        includeSubtopics
      );
      if (share) {
        setExistingShare(share);
        setShareLink(`${window.location.origin}/shared/${share.share_token}`);
      }
    } catch (error) {
      console.error("Erro ao criar compartilhamento:", error);
    }
    setLoading(false);
  };

  const handleTogglePublic = async () => {
    if (!existingShare) return;
    const newValue = !isPublic;
    setIsPublic(newValue);
    await sharingService.updateShareVisibility(existingShare.id, newValue);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteShare = async () => {
    if (!existingShare) return;
    await sharingService.deleteShare(existingShare.id);
    setExistingShare(null);
    setShareLink("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Tópico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">{topicTitle}</div>

          {hasSubtopics && !existingShare && (
            <div className="flex items-center justify-between">
              <Label htmlFor="include-subtopics">Incluir sub-tópicos</Label>
              <Switch
                id="include-subtopics"
                checked={includeSubtopics}
                onCheckedChange={setIncludeSubtopics}
              />
            </div>
          )}

          {existingShare && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="is-public">Link público</Label>
                <Switch
                  id="is-public"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                />
              </div>

              <div className="space-y-2">
                <Label>Link de compartilhamento</Label>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="destructive" onClick={handleDeleteShare}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Compartilhamento
                </Button>
              </div>
            </>
          )}

          {!existingShare && (
            <Button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Criar Link de Compartilhamento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
