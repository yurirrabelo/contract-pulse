import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpiringContractsGroup, ContractWithDetails } from '@/types';
import { formatCurrency, formatDate } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Users, Building2, DollarSign } from 'lucide-react';

interface ExpirationAlertCardProps {
  group: ExpiringContractsGroup;
  onClick?: () => void;
}

const alertStyles = {
  30: {
    borderColor: 'border-l-alert-30',
    bgColor: 'bg-alert-30/10',
    textColor: 'text-alert-30',
    label: '30 dias',
    icon: AlertTriangle,
  },
  60: {
    borderColor: 'border-l-alert-60',
    bgColor: 'bg-alert-60/10',
    textColor: 'text-alert-60',
    label: '60 dias',
    icon: Clock,
  },
  90: {
    borderColor: 'border-l-alert-90',
    bgColor: 'bg-alert-90/10',
    textColor: 'text-alert-90',
    label: '90 dias',
    icon: Clock,
  },
};

export function ExpirationAlertCard({ group, onClick }: ExpirationAlertCardProps) {
  const style = alertStyles[group.days];
  const Icon = style.icon;

  return (
    <Card
      className={cn(
        'border-l-4 cursor-pointer transition-all hover:shadow-md animate-fade-in',
        style.borderColor
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', style.bgColor)}>
              <Icon className={cn('h-5 w-5', style.textColor)} />
            </div>
            <div>
              <CardTitle className="text-lg">
                Vencendo em até {style.label}
              </CardTitle>
              <CardDescription>
                {group.contracts.length} {group.contracts.length === 1 ? 'contrato' : 'contratos'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-sm font-bold', style.textColor)}>
            {formatCurrency(group.totalMonthlyValue)}/mês
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{group.clientsAffected}</p>
              <p className="text-xs text-muted-foreground">
                {group.clientsAffected === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{group.professionalsInvolved}</p>
              <p className="text-xs text-muted-foreground">
                {group.professionalsInvolved === 1 ? 'profissional' : 'profissionais'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(group.totalMonthlyValue)}</p>
              <p className="text-xs text-muted-foreground">em risco</p>
            </div>
          </div>
        </div>

        {/* Contract list preview */}
        {group.contracts.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {group.contracts.slice(0, 3).map((contract) => (
              <ContractPreviewItem key={contract.id} contract={contract} />
            ))}
            {group.contracts.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{group.contracts.length - 3} {group.contracts.length - 3 === 1 ? 'contrato' : 'contratos'}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContractPreviewItem({ contract }: { contract: ContractWithDetails }) {
  return (
    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{contract.client?.name}</p>
        <p className="text-xs text-muted-foreground">
          {contract.contractNumber} • Vence em {formatDate(contract.endDate)}
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="font-medium">{formatCurrency(contract.monthlyValue)}</p>
        <p className="text-xs text-muted-foreground">
          {contract.positions.length} {contract.positions.length === 1 ? 'vaga' : 'vagas'}
        </p>
      </div>
    </div>
  );
}
