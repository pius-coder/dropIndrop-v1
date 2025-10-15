/**
 * Drop Validation Display Component
 * 
 * Shows same-day rule validation results
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import type { DropValidationResponse } from "../model/types";

interface DropValidationDisplayProps {
  validation: DropValidationResponse;
  showDetails?: boolean;
}

export function DropValidationDisplay({ 
  validation,
  showDetails = true 
}: DropValidationDisplayProps) {
  const { canSend, validations, summary } = validation;

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className={canSend ? "border-green-500" : "border-red-500"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {canSend ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-green-700">
                    ✅ Envoi possible
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Le drop peut être envoyé maintenant
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-700">
                    🚫 Envoi bloqué
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tous les articles ont déjà été envoyés aujourd'hui
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résumé de validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.totalGroups}</div>
              <div className="text-xs text-muted-foreground">Groupes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.clearGroups}</div>
              <div className="text-xs text-muted-foreground">OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.partiallyBlockedGroups}
              </div>
              <div className="text-xs text-muted-foreground">Partiel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.blockedGroups}</div>
              <div className="text-xs text-muted-foreground">Bloqués</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Group Details */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détails par groupe</CardTitle>
            <CardDescription>
              Validation règle du même jour (un article par groupe par jour)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validations.map((groupValidation) => {
                const isBlocked = groupValidation.allowedArticleIds.length === 0;
                const isPartial =
                  groupValidation.allowedArticleIds.length > 0 &&
                  groupValidation.blockedArticleIds.length > 0;
                const isClear = groupValidation.blockedArticleIds.length === 0;

                return (
                  <div
                    key={groupValidation.groupId}
                    className={`rounded-lg border p-4 ${
                      isBlocked
                        ? "border-red-200 bg-red-50"
                        : isPartial
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {isBlocked ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : isPartial ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          <h4 className="font-semibold">
                            {groupValidation.groupName}
                          </h4>
                        </div>

                        <div className="flex gap-2 text-sm">
                          <Badge variant={isClear ? "default" : "secondary"}>
                            {groupValidation.allowedArticleIds.length} autorisé(s)
                          </Badge>
                          {groupValidation.blockedArticleIds.length > 0 && (
                            <Badge variant="destructive">
                              {groupValidation.blockedArticleIds.length} bloqué(s)
                            </Badge>
                          )}
                        </div>

                        {/* Warnings */}
                        {groupValidation.warnings.length > 0 && (
                          <div className="space-y-1">
                            {groupValidation.warnings.map((warning, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      {!canSend && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  💡 Que faire maintenant ?
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Retirer les articles déjà envoyés aujourd'hui</li>
                  <li>Envoyer demain aux groupes bloqués</li>
                  <li>Créer un nouveau drop avec d'autres articles</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
