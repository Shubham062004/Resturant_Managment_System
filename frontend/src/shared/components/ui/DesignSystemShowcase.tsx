import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, ChevronRight, Heart, Play } from 'lucide-react';

// Shared components imports
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Select, { SelectOption } from './Select';
import Checkbox from './Checkbox';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import Switch from './Switch';
import Badge from './Badge';
import Avatar from './Avatar';
import Modal from './Modal';
import Drawer from './Drawer';
import Tooltip from './Tooltip';
import Breadcrumb from './Breadcrumb';
import Tabs from './Tabs';
import Pagination from './Pagination';
import Alert from './Alert';
import { useToast } from './Toast';
import EmptyState from './EmptyState';
import {
  ProductSkeleton,
  TableSkeleton,
  CardSkeleton,
  ProfileSkeleton,
} from './Skeleton';

// Theme imports
import { typographyClasses } from '../../theme/typography';

// Animations
import { fadeUp, springTransition } from '../../theme/animations';

export const DesignSystemShowcase: React.FC = () => {
  const toast = useToast();

  // Component state toggles
  const [activeTab, setActiveTab] = useState('tokens');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPos, setDrawerPos] = useState<'left' | 'right' | 'bottom'>('right');

  // Input states
  const [inputText, setInputText] = useState('');
  const [checkboxVal, setCheckboxVal] = useState(false);
  const [radioVal, setRadioVal] = useState('opt-1');
  const [switchVal, setSwitchVal] = useState(true);
  const [selectSingle, setSelectSingle] = useState('');
  const [selectMulti, setSelectMulti] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Animation trigger states
  const [animKey, setAnimKey] = useState(0);

  const selectOptions: SelectOption[] = [
    { label: 'Oven Roasted Chicken', value: 'chicken' },
    { label: 'Spicy Pepperoni Pizza', value: 'pizza' },
    { label: 'Truffle Mushroom Risotto', value: 'risotto' },
    { label: 'Garlic Butter Shrimp', value: 'shrimp' },
    { label: 'Warm Chocolate Lava Cake', value: 'lava-cake' },
  ];

  const handleOpenDrawer = (pos: 'left' | 'right' | 'bottom') => {
    setDrawerPos(pos);
    setIsDrawerOpen(true);
  };

  const colorGrid = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {/* Brand colors */}
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-primary shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          #B22222
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display">Primary</span>
          <span className="text-xs text-muted-foreground">Firebrick Red</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-primary-hover shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          #8B1A1A
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display">Primary Hover</span>
          <span className="text-xs text-muted-foreground">Dark Firebrick</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-accent shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          #FF8C42
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display">Accent</span>
          <span className="text-xs text-muted-foreground">Warm Orange</span>
        </div>
      </div>

      {/* Semantic Feedback colors */}
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-success shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          Success
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display text-success">Success</span>
          <span className="text-xs text-muted-foreground">#22C55E</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-warning shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          Warning
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display text-warning">Warning</span>
          <span className="text-xs text-muted-foreground">#F59E0B</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-danger shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          Danger
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display text-danger">Danger</span>
          <span className="text-xs text-muted-foreground">#EF4444</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-info shadow-inner flex items-end p-3 text-white font-display font-bold text-xs uppercase">
          Info
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display text-info">Info</span>
          <span className="text-xs text-muted-foreground">#3B82F6</span>
        </div>
      </div>

      {/* Layout / Surface colors */}
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-background border border-border shadow-inner flex items-end p-3 text-foreground font-display font-bold text-xs uppercase">
          Background
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display">Background</span>
          <span className="text-xs text-muted-foreground">Warm Light / Dark</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 w-full rounded-xl bg-card border border-border shadow-inner flex items-end p-3 text-foreground font-display font-bold text-xs uppercase">
          Surface
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold font-display">Surface (Card)</span>
          <span className="text-xs text-muted-foreground">White / Dark Grey</span>
        </div>
      </div>
    </div>
  );

  const mainShowcaseTabs = [
    {
      id: 'tokens',
      label: 'Core Tokens & Colors',
      content: (
        <div className="space-y-10">
          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Color Palettes
            </h4>
            {colorGrid}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Typography
            </h4>
            <div className="flex flex-col gap-6 bg-card border border-border p-6 rounded-2xl">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Display XL (Outfit)
                </p>
                <h1 className={typographyClasses.displayXL}>Oven Flame Roast</h1>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Display LG (Outfit)
                </p>
                <h2 className={typographyClasses.displayLG}>Gourmet Kitchen Terminal</h2>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Display MD (Outfit)
                </p>
                <h3 className={typographyClasses.displayMD}>Woodfired Oven Pizzas</h3>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Heading XL (Outfit)
                </p>
                <h4 className={typographyClasses.headingXL}>Active Chef Stations</h4>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Heading LG (Outfit)
                </p>
                <h5 className={typographyClasses.headingLG}>Order Queue Details</h5>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Heading MD (Inter)
                </p>
                <h6 className={typographyClasses.headingMD}>Menu Selection Config</h6>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Body LG (Inter)
                </p>
                <p className={typographyClasses.bodyLG}>
                  This is body large text, optimized for descriptors, card text, or menu item
                  descriptions.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Body MD (Inter)
                </p>
                <p className={typographyClasses.bodyMD}>
                  This is body medium text. This is the main reading copy for transactional tables,
                  form fields, and sidebar settings.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Body SM (Inter)
                </p>
                <p className={typographyClasses.bodySM}>
                  This is body small text, used for denser receipt items, small details, and KDS
                  card indicators.
                </p>
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Caption
                  </p>
                  <p className={typographyClasses.caption}>
                    * Mandatory field required for checkout.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Tiny Label
                  </p>
                  <p className={typographyClasses.tiny}>Delivered</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      ),
    },
    {
      id: 'buttons-inputs',
      label: 'Buttons & Inputs',
      content: (
        <div className="space-y-10">
          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Button Variants
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost Trigger</Button>
              <Button variant="success">Success Box</Button>
              <Button variant="danger">Danger Action</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Button Sizes & Icons
            </h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">XS Button</Button>
              <Button size="sm">SM Button</Button>
              <Button size="md" leftIcon={<Sparkles size={16} />}>
                With Left Icon
              </Button>
              <Button size="lg" rightIcon={<ChevronRight size={18} />}>
                With Right Icon
              </Button>
              <Button size="xl">XL Button</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Button States
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button isLoading>Processing...</Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Form Elements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-2xl">
              <Input
                label="Standard text input"
                placeholder="Enter some details..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                prefixIcon={<Search size={16} />}
              />
              <Input label="Password field" type="password" placeholder="Enter secret pass..." />
              <Input
                label="Success Validation state"
                success="Valid customer profile loaded."
                defaultValue="Shubham Kumar"
              />
              <Input
                label="Error Validation state"
                error="Invalid email address format."
                defaultValue="shubham@invalid"
              />
              <Textarea
                label="Textarea field"
                placeholder="Write specific notes for the kitchen (allergies, prep requests)..."
                rows={3}
              />
              <div className="flex flex-col gap-4.5 justify-center">
                <Checkbox
                  label="Check this to authorize receipt printing"
                  checked={checkboxVal}
                  onChange={setCheckboxVal}
                />
                <RadioGroup
                  name="showcase-radio"
                  value={radioVal}
                  onChange={setRadioVal}
                  direction="horizontal"
                >
                  <RadioGroupItem value="opt-1" label="Standard Dine-In" />
                  <RadioGroupItem value="opt-2" label="Home Delivery" />
                </RadioGroup>
                <Switch
                  label="Enable Instant KDS Notifications"
                  checked={switchVal}
                  onChange={setSwitchVal}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Dropdown Selector (Custom Select)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-2xl min-h-[350px]">
              <Select
                label="Single Select Dropdown (Searchable)"
                options={selectOptions}
                value={selectSingle}
                onChange={setSelectSingle}
                isSearchable
                placeholder="Select dish..."
              />
              <Select
                label="Multi Select Dropdown"
                options={selectOptions}
                value={selectMulti}
                onChange={setSelectMulti}
                isMulti
                placeholder="Pick multiple dishes..."
              />
            </div>
          </section>
        </div>
      ),
    },
    {
      id: 'overlays-badges',
      label: 'Badges, Overlays & Toasts',
      content: (
        <div className="space-y-10">
          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Badges & Avatars
            </h4>
            <div className="flex items-center gap-6 flex-wrap bg-card border border-border p-6 rounded-2xl">
              <div className="flex gap-2">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="success">Completed</Badge>
                <Badge variant="warning">Preparing</Badge>
                <Badge variant="error">Cancelled</Badge>
                <Badge variant="info">Active POS</Badge>
              </div>
              <div className="h-6 w-px bg-border/80" />
              <div className="flex gap-3">
                <Avatar size="xs" name="Shubham Kumar" />
                <Avatar size="sm" name="Admin Manager" />
                <Avatar size="md" name="Kitchen Staff" />
                <Avatar size="lg" name="Delivery Rider" />
                <Avatar size="xl" name="Super Admin" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              System Alerts
            </h4>
            <div className="flex flex-col gap-4">
              <Alert variant="info" title="System Connection Status">
                Active POS connection established with Server branch #021.
              </Alert>
              <Alert variant="success" title="Backup Synced">
                Local database backup synced with cloud clusters.
              </Alert>
              <Alert variant="warning" title="Heavy Load Warning">
                Kitchen ticket queue is full. Orders may delay by 10-15 minutes.
              </Alert>
              <Alert variant="error" title="Transaction Failed">
                Payment gateway connection timed out. Please try again.
              </Alert>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Toasts triggers
            </h4>
            <div className="flex gap-4 flex-wrap bg-card border border-border p-6 rounded-2xl">
              <Button
                variant="success"
                onClick={() => toast.success('Order completed successfully!')}
              >
                Success Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.warning('Prisma database is rebuilding...')}
              >
                Warning Toast
              </Button>
              <Button
                variant="danger"
                onClick={() => toast.error('Failed to dispatch delivery rider.')}
              >
                Error Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info('Printer ink low on receipt rolls.')}
              >
                Info Toast
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Tooltip floating overlays
            </h4>
            <div className="flex gap-6 bg-card border border-border p-6 rounded-2xl items-center justify-around">
              <Tooltip content="Helper description at top" position="top">
                <Button size="sm">Tooltip Top</Button>
              </Tooltip>
              <Tooltip content="Helper description at bottom" position="bottom">
                <Button size="sm">Tooltip Bottom</Button>
              </Tooltip>
              <Tooltip content="Left aligned explanation" position="left">
                <Button size="sm">Tooltip Left</Button>
              </Tooltip>
              <Tooltip content="Right aligned explanation" position="right">
                <Button size="sm">Tooltip Right</Button>
              </Tooltip>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Modals & Drawer sheets
            </h4>
            <div className="flex gap-4 flex-wrap bg-card border border-border p-6 rounded-2xl">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Button variant="secondary" onClick={() => handleOpenDrawer('left')}>
                Drawer Slide Left
              </Button>
              <Button variant="secondary" onClick={() => handleOpenDrawer('right')}>
                Drawer Slide Right
              </Button>
              <Button variant="secondary" onClick={() => handleOpenDrawer('bottom')}>
                Drawer Slide Bottom
              </Button>
            </div>
          </section>

          {/* Modal instance */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Kitchen Recipe Configuration"
          >
            <div className="space-y-4">
              <p>Configure recipe values for dynamic POS pricing systems.</p>
              <Input label="Dish Name" defaultValue="Oven Baked Pepperoni Pizza" />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    toast.success('Recipe configured!');
                  }}
                >
                  Save Recipes
                </Button>
              </div>
            </div>
          </Modal>

          {/* Drawer instance */}
          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            title="System Active Diagnostics"
            position={drawerPos}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h5 className="font-bold text-sm">Printer Status</h5>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="space-y-2">
                <h5 className="font-bold text-sm">Memory Usage</h5>
                <p className="text-xs text-muted-foreground">34% of 16GB allocated</p>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[34%]" />
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setIsDrawerOpen(false)}
              >
                Shutdown Node
              </Button>
            </div>
          </Drawer>
        </div>
      ),
    },
    {
      id: 'layouts-skeletons',
      label: 'Layouts & Skeletons',
      content: (
        <div className="space-y-10">
          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Breadcrumbs & Pagination
            </h4>
            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6">
              <Breadcrumb
                items={[
                  { label: 'Admin Panel', href: '#' },
                  { label: 'Inventory Management', href: '#' },
                  { label: 'Ingredient List' },
                ]}
              />
              <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Empty States
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                type="orders"
                actionLabel="Create Fake Ticket"
                onAction={() => toast.success('Created mock order.')}
              />
              <EmptyState type="search" />
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold font-display border-b border-border/40 pb-2">
              Pulse Loading Skeletons
            </h4>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Card Skeleton
                </p>
                <div className="max-w-md">
                  <CardSkeleton />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Profile Skeleton
                </p>
                <ProfileSkeleton />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Table Skeleton
                </p>
                <TableSkeleton />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Product Grid Skeleton
                </p>
                <ProductSkeleton />
              </div>
            </div>
          </section>
        </div>
      ),
    },
    {
      id: 'animations',
      label: 'Framer Motion Transitions',
      content: (
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h4 className="text-lg font-bold font-display">Transitions playground</h4>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play size={14} />}
                onClick={() => setAnimKey((k) => k + 1)}
              >
                Replay Animations
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" key={animKey}>
              {/* Fade Up Card */}
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-2"
              >
                <div className="text-sm font-bold font-display text-primary">
                  Fade Up Transition
                </div>
                <p className="text-xs text-muted-foreground">
                  Pushes up from bottom with organic spring physics on mount.
                </p>
              </motion.div>

              {/* Hover Scale Interaction */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                className="bg-card border border-border/80 p-6 rounded-2xl flex flex-col gap-2 cursor-pointer shadow-md hover:shadow-xl hover:border-accent/40"
              >
                <div className="text-sm font-bold font-display text-accent flex items-center gap-1.5">
                  <Heart size={16} fill="currentColor" /> Hover Scale & Rotate
                </div>
                <p className="text-xs text-muted-foreground">
                  Spring scale modifier responding dynamically to clicks and pointer hovers.
                </p>
              </motion.div>
            </div>
          </section>
        </div>
      ),
    },
  ];

  const mainBreadcrumb = [
    { label: 'Restaurant Hub', href: '#' },
    { label: 'Core UI Foundation', href: '#' },
    { label: 'Design System Playground' },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb path */}
      <Breadcrumb items={mainBreadcrumb} />

      {/* Hero Banner Area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-hover to-accent rounded-3xl p-8 md:p-12 text-white flex flex-col justify-between shadow-xl min-h-[220px]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-3 max-w-2xl">
          <Badge variant="neutral" className="bg-white/10 text-white border-white/20 w-fit">
            PR-002 UI System Release
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-none">
            Oven Xpress Design System
          </h1>
          <p className="text-white/80 font-sans text-sm md:text-base leading-relaxed">
            Centralized design token engine, responsive layout frameworks, micro-animations, and
            reusable components.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs tabs={mainShowcaseTabs} activeTabId={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default DesignSystemShowcase;
