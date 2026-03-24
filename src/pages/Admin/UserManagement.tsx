import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/helpers';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface AdminUserRow {
  id: string;
  uid?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  createdAt?: { toDate: () => Date };
}

const dash = (v: string | undefined) => v || '—';

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        const rows: AdminUserRow[] = [];
        snap.forEach((d) => {
          rows.push({ id: d.id, ...d.data() } as AdminUserRow);
        });
        rows.sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return tb - ta;
        });
        setUsers(rows);
      } catch (e: unknown) {
        toast.error('Failed to load users', { description: (e as Error).message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const formatJoined = (u: AdminUserRow) => {
    try {
      const d = u.createdAt?.toDate?.();
      return d ? formatDate(d) : '—';
    } catch {
      return '—';
    }
  };

  if (loading) {
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
              <h1 className="text-3xl font-display font-bold">User management</h1>
              <p className="text-muted-foreground mt-1">Registered accounts from Firestore</p>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Users ({filtered.length})</CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, phone, UID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="font-mono text-xs">UID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{dash(u.name)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{dash(u.email)}</TableCell>
                          <TableCell>{dash(u.phone)}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role || 'customer'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatJoined(u)}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[140px] truncate" title={u.id}>
                            {u.id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
