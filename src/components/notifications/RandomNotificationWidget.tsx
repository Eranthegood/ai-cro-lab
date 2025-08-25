import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';

interface RandomNotificationWidgetProps {
  minDelay?: number; // in seconds
  maxDelay?: number; // in seconds
  displayDuration?: number; // in seconds
  enabled?: boolean;
}

const INDUSTRIES = [
  'SaaS',
  'Ecommerce',
  'Fintech',
  'Healthcare',
  'EdTech',
  'Real Estate',
  'Marketing',
  'Gaming',
  'Travel',
  'Fashion',
  'Food & Beverage',
  'Fitness',
  'B2B',
  'Marketplace'
];

export const RandomNotificationWidget: React.FC<RandomNotificationWidgetProps> = ({
  minDelay = 1,
  maxDelay = 20,
  displayDuration = 4,
  enabled = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [industry, setIndustry] = useState('');

  const getRandomIndustry = () => {
    return INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
  };

  const getRandomDelay = () => {
    return (Math.random() * (maxDelay - minDelay) + minDelay) * 1000;
  };

  const showNotification = () => {
    if (!enabled) return;
    
    setIndustry(getRandomIndustry());
    setIsVisible(true);
    
    // Auto hide after displayDuration
    setTimeout(() => {
      setIsVisible(false);
    }, displayDuration * 1000);
  };

  const scheduleNextNotification = () => {
    if (!enabled) return;
    
    const delay = getRandomDelay();
    setTimeout(() => {
      showNotification();
      scheduleNextNotification(); // Schedule the next one
    }, delay);
  };

  useEffect(() => {
    if (enabled) {
      // Initial notification
      const initialDelay = getRandomDelay();
      setTimeout(() => {
        showNotification();
        scheduleNextNotification();
      }, initialDelay);
    }
  }, [enabled]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed bottom-4 right-4 z-50"
          style={{ marginBottom: '80px' }} // Space for BackgroundTaskPanel
        >
          <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border shadow-lg max-w-sm">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      New beta tester join !
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {industry}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};