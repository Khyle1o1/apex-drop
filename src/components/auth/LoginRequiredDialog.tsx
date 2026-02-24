import { Link, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginRequiredDialog({ open, onOpenChange }: LoginRequiredDialogProps) {
  const location = useLocation();
  const from = encodeURIComponent(location.pathname + location.search);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>
            You need to log in as a verified student or alumni before you can add items to your cart or proceed to checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <Link to={`/login?mode=student&from=${from}`} className="block">
            <Button className="w-full" size="lg">
              Login as Student
            </Button>
          </Link>
          <Link to={`/login?mode=alumni&from=${from}`} className="block">
            <Button className="w-full" size="lg" variant="outline">
              Login as Alumni
            </Button>
          </Link>
        </div>

        <DialogFooter className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Pickup Only — University Economic Enterprise Unit
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Continue browsing
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

