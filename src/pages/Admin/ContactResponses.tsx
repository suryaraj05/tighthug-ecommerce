import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils/helpers';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search, Mail } from 'lucide-react';
import {
  getContactMessages,
  markContactMessageRead,
  ContactMessage,
} from '@/services/contactService';

const ContactResponses = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const initialLoadRef = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getContactMessages();
      setMessages(list);
    } catch (e: unknown) {
      toast.error('Failed to load messages', { description: (e as Error).message });
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = messages.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const openDetail = async (m: ContactMessage) => {
    setSelected(m);
    if (m.status !== 'read') {
      try {
        await markContactMessageRead(m.id);
        setMessages((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, status: 'read' } : x))
        );
      } catch (e: unknown) {
        toast.error('Could not update status', { description: (e as Error).message });
      }
    }
  };

  const createdLabel = (m: ContactMessage) => {
    const c = m.createdAt;
    if (c && typeof c.toDate === 'function') {
      try {
        return formatDateTime(c.toDate());
      } catch {
        return '—';
      }
    }
    return '—';
  };

  if (loading && initialLoadRef.current) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 max-w-6xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Contact us responses</h1>
              <p className="text-muted-foreground mt-1">Messages from the contact form</p>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Inbox ({filtered.length})</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={load} disabled={loading}>
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No messages yet.</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((m) => (
                          <TableRow
                            key={m.id}
                            className="cursor-pointer"
                            onClick={() => openDetail(m)}
                          >
                            <TableCell className="whitespace-nowrap text-sm">
                              {createdLabel(m)}
                            </TableCell>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${m.email}`}
                                className="flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="h-3 w-3" />
                                {m.email}
                              </a>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{m.subject}</TableCell>
                            <TableCell>
                              <Badge variant={m.status === 'read' ? 'secondary' : 'default'}>
                                {m.status === 'read' ? 'Read' : 'New'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected?.subject}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">{createdLabel(selected)}</p>
                <p>
                  <span className="font-medium">From:</span> {selected.name} ({selected.email})
                </p>
                <div className="rounded-md border bg-muted/30 p-3 whitespace-pre-wrap">{selected.message}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ContactResponses;
