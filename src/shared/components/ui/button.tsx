import { hideKeyboard } from '@/src/lib/keyboard';
import { cn } from '@/src/lib/utils';
import { TextClassContext } from '@/src/shared/components/ui/text';
import { cva, type VariantProps } from 'class-variance-authority';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureResponderEvent, Platform, Pressable, View } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 shadow-none rounded-full',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary active:bg-primary/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        'gradient-primary': cn(
          'shadow-sm shadow-black/5',
          Platform.select({ web: 'bg-gradient-to-r from-primary to-[#D22975] hover:opacity-90' })
        ),
        outline: cn(
          'border-border bg-transparent active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        secondary: cn(
          'bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        white: cn(
          'bg-white active:bg-white/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-white/90' })
        ),
        'light-primary': cn(
          'bg-light-primary-background active:bg-light-primary-background/90 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-light-primary-background/90' })
        ),
      },
      size: {
        default: 'h-14 sm:h-9 px-4',
        sm: 'h-9 gap-1.5 sm:h-8 px-3',
        lg: 'h-11 sm:h-10 px-6',
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-foreground font-medium text-base',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        'gradient-primary': 'text-primary-foreground',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        white: 'text-red-600',
        'light-primary': 'text-primary',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    hideKeyboardWhenPress?: boolean;
  };

function Button({ className, variant = 'default', size, children, hideKeyboardWhenPress, onPress, ...props }: ButtonProps) {
  const isGradientPrimary = variant === 'gradient-primary';

  const handlePress = (event: GestureResponderEvent) => {
    if (hideKeyboardWhenPress) {
      hideKeyboard();
    }
    if (onPress) {
      onPress(event);
    }
  }

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        style={isGradientPrimary && Platform.OS !== 'web' ? { overflow: 'hidden' } : undefined}
        role="button"
        onPress={handlePress}
        {...props}
      >
        {(state) => (
          <>
            {isGradientPrimary && Platform.OS !== 'web' && (
              <LinearGradient
                colors={['#F50008', '#D22975']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 9999,
                }}
              />
            )}

            <View className='flex-row items-center justify-center gap-2'>
              {typeof children === 'function' ? children(state) : children}
            </View>
          </>
        )}
      </Pressable>

    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };

