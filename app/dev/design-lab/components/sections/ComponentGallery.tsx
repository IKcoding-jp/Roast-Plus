'use client';

import {
  categoryLabels,
  getComponentsByCategory,
} from '@/components/ui/registry';
import { Card, Badge } from '@/components/ui';

export default function ComponentGallery() {
  const grouped = getComponentsByCategory();
  const categories = Object.keys(grouped) as Array<keyof typeof grouped>;

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const items = grouped[category];
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold text-ink mb-4">
              {categoryLabels[category]}
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {items.map((item) => (
                <Card
                  key={item.name}
                  variant="default"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-ink">
                        {item.name}
                      </h4>
                      {item.isNew && (
                        <Badge variant="success" size="sm">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-ink-sub mb-4">
                      {item.description}
                    </p>
                    <div className="p-4 rounded-lg bg-ground">
                      <item.Demo />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
