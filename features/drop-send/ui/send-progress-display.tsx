/**
 * Send Progress Display Component
 * 
 * Real-time progress tracking for drop sending
 */

"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { useSendProgress, useCancelSend } from "../lib/use-send-drop";
import type { SendProgress } from "../model/types";

interface SendProgressDisplayProps {
  dropId: string;
  dropName: string;
  onComplete?: () => void;
}

export function SendProgressDisplay({
  dropId,
  dropName,
  onComplete,
}: SendProgressDisplayProps) {
  const { data: progress, isLoading } = useSendProgress(dropId, true);
  const { mutate: cancel, isPending: isCanceling } = useCancelSend(dropId);

  useEffect(() => {
    if (progress?.status === "completed" && onComplete) {
      onComplete();
    }
  }, [progress?.status, onComplete]);

  if (isLoading || !progress) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Chargement du statut d'envoi...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = progress.totalMessages > 0
    ? (progress.sentMessages / progress.totalMessages) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Envoi en cours</CardTitle>
            {progress.status === "sending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancel()}
                disabled={isCanceling}
              >
                {isCanceling ? "Annulation..." : "Annuler"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{dropName}</span>
              <span className="text-sm text-muted-foreground">
                {progress.sentMessages}/{progress.totalMessages} messages
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(overallProgress)}% complété
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            <div>
              <div className="text-2xl font-bold">{progress.totalGroups}</div>
              <div className="text-xs text-muted-foreground">Groupes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {progress.completedGroups}
              </div>
              <div className="text-xs text-muted-foreground">Envoyés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {progress.sentMessages}
              </div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {progress.errors.length}
              </div>
              <div className="text-xs text-muted-foreground">Erreurs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Group Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails par groupe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.groups.map((group) => {
              const groupProgress = group.totalCount > 0
                ? (group.sentCount / group.totalCount) * 100
                : 0;

              return (
                <div key={group.groupId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {group.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {group.status === "sending" && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {group.status === "failed" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {group.status === "pending" && (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">{group.groupName}</span>
                    </div>
                    <Badge
                      variant={
                        group.status === "completed"
                          ? "default"
                          : group.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {group.sentCount}/{group.totalCount}
                    </Badge>
                  </div>
                  <Progress value={groupProgress} className="h-1.5" />
                  {group.currentArticle && (
                    <p className="text-xs text-muted-foreground">
                      Envoi: {group.currentArticle}
                    </p>
                  )}
                  {group.error && (
                    <p className="text-xs text-red-600">❌ {group.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {progress.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700">
              Erreurs ({progress.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {progress.errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-600">
                  • {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
