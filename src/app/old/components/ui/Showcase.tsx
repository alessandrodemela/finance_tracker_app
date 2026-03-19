import React, { useState } from 'react';
import { Card } from './Card';
import { TransactionCard } from './TransactionCard';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { TabSelector } from './TabSelector';
import { ListItem } from './ListItem';
import { StatBox } from './StatBox';

// Icons placeholder sizes for testing
const PlaceholderIcon = () => <div className="w-5 h-5 bg-[var(--muted)] rounded-full animate-pulse" />;

export function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState('daily');
  
  return (
    <div className="flex flex-col gap-8 p-6 pb-32">
      {/* 1. Base Card */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Cards</h2>
        <Card>
          <p className="text-[var(--muted)]">This is a base glass-panel card.</p>
        </Card>
        <Card variant="raised">
          <p className="text-[var(--muted)]">This is a raised, semi-transparent card for extra depth.</p>
        </Card>
      </section>

      {/* 2. Transaction Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Transactions</h2>
        <TransactionCard 
          title="Amazon Prime" 
          subtitle="Subscription" 
          amount={14.99} 
          type="expense" 
          icon={<PlaceholderIcon />} 
        />
        <TransactionCard 
          title="Salary" 
          subtitle="Direct Deposit" 
          amount={4500.00} 
          type="income" 
          icon={<PlaceholderIcon />} 
        />
      </section>

      {/* 3 & 4. Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="icon">
            <PlaceholderIcon />
          </Button>
        </div>
      </section>

      {/* 5. Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Inputs</h2>
        <Input placeholder="Enter amount..." />
        <Input icon={<PlaceholderIcon />} placeholder="Search transactions..." />
      </section>

      {/* 7. Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Badges</h2>
        <div className="flex gap-2">
          <Badge variant="positive">+12.5%</Badge>
          <Badge variant="negative">-4.2%</Badge>
          <Badge variant="neutral">Pending</Badge>
        </div>
      </section>

      {/* 8. Tab Selector */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Tab Selector</h2>
        <TabSelector 
          tabs={[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </section>

      {/* 9. List Item */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">List Items</h2>
        <Card className="p-0 overflow-hidden">
          <ListItem 
            interactive
            left={<PlaceholderIcon />}
            content={
              <>
                <div className="font-semibold text-white">Food & Dining</div>
                <div className="text-sm text-[var(--muted)]">4 Transactions</div>
              </>
            }
            right={<span className="text-white font-medium">$124.50</span>}
          />
          <ListItem 
            interactive
            left={<PlaceholderIcon />}
            content={
              <>
                <div className="font-semibold text-white">Transportation</div>
                <div className="text-sm text-[var(--muted)]">2 Transactions</div>
              </>
            }
            right={<span className="text-white font-medium">$45.00</span>}
          />
        </Card>
      </section>

      {/* 10. Stat Box */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--muted)] font-sans">Stat Box</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatBox 
            label="Total Balance" 
            value="$12,450.00" 
            icon={<PlaceholderIcon />}
          />
          <StatBox 
            label="Monthly Spend" 
            value="$2,140.50" 
            icon={<PlaceholderIcon />}
            trend={{ value: 12.5, label: 'vs last month', isPositive: false }}
          />
        </div>
      </section>
    </div>
  );
}
