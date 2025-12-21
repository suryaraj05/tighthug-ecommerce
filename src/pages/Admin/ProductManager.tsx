import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, X, FileSpreadsheet } from 'lucide-react';
import { formatPrice } from '@/utils/helpers';
import { toast } from 'sonner';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from '@/services/productService';
import { uploadImageToCloudinary, uploadMultipleImages } from '@/services/cloudinaryService';
import { CATEGORIES, SEASONS, SIZES } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    isHighlighted: false,
    salesCount: '',
    category: '',
    season: '',
    sizes: [] as string[],
    stock: {} as Record<string, number>,
    images: [] as string[],
    fabric: '', // Fabric variant
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error: any) {
      toast.error('Failed to load products', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discountPercentage: '',
      isHighlighted: false,
      salesCount: '',
      category: '',
      season: '',
      sizes: [],
      stock: {},
      images: [],
      fabric: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage?.toString() || '',
      isHighlighted: product.isHighlighted || false,
      salesCount: product.salesCount?.toString() || '',
      category: product.category,
      season: product.season,
      sizes: product.sizes,
      stock: product.stock,
      images: product.images,
      fabric: product.fabric || '',
    });
    setImagePreviews(product.images);
    setImageFiles([]);
    setShowAddModal(true);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];

    setFormData({
      ...formData,
      sizes: newSizes,
      stock: newSizes.reduce((acc, s) => {
        acc[s] = formData.stock[s] || 0;
        return acc;
      }, {} as Record<string, number>),
    });
  };

  const handleStockChange = (size: string, value: string) => {
    setFormData({
      ...formData,
      stock: {
        ...formData.stock,
        [size]: parseInt(value) || 0,
      },
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles([...imageFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

        // Expected CSV format: name,description,price,category,season,sizes,stock,images
        const products = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          if (values.length < 5) continue;

          const sizes = values[5]?.split('|') || [];
          const stockValues = values[6]?.split('|') || [];
          const stock: Record<string, number> = {};
          sizes.forEach((size, idx) => {
            stock[size] = parseInt(stockValues[idx] || '0');
          });

          products.push({
            name: values[0],
            description: values[1] || '',
            price: parseFloat(values[2]) || 0,
            category: values[3] || 'T-Shirts',
            season: values[4] || 'All Season',
            sizes,
            stock,
            images: values[7]?.split('|') || [],
          });
        }

        setUploading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
          try {
            await createProduct(product);
            successCount++;
          } catch (error) {
            console.error('Error creating product:', error);
            errorCount++;
          }
        }

        toast.success(`Bulk upload complete! ${successCount} products created, ${errorCount} failed.`);
        setShowCsvUpload(false);
        loadProducts();
      } catch (error: any) {
        toast.error('Failed to parse CSV', {
          description: error.message || 'Please check the CSV format.',
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls = [...formData.images];

      // Upload new images
      if (imageFiles.length > 0) {
        const uploadResults = await uploadMultipleImages(imageFiles, 'stock');
        imageUrls = [...imageUrls, ...uploadResults.map((r) => r.secure_url)];
      }

      const price = parseFloat(formData.price);
      const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;
      
      // Calculate discount percentage if original price is provided
      let discountPercentage: number | null = null;
      if (formData.discountPercentage) {
        discountPercentage = parseFloat(formData.discountPercentage);
      } else if (originalPrice && originalPrice > price) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
      }
      
      // Build product data object, only including defined values
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price,
        category: formData.category,
        season: formData.season,
        sizes: formData.sizes,
        stock: formData.stock,
        images: imageUrls,
        isHighlighted: formData.isHighlighted || false,
      };

      // Only add optional fields if they have values (not undefined)
      if (originalPrice !== null && originalPrice > 0) {
        productData.originalPrice = originalPrice;
      }
      
      if (discountPercentage !== null && discountPercentage > 0) {
        productData.discountPercentage = discountPercentage;
      }
      
      if (formData.salesCount && formData.salesCount.trim()) {
        const salesCount = parseInt(formData.salesCount);
        if (!isNaN(salesCount) && salesCount >= 0) {
          productData.salesCount = salesCount;
        }
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }

      setShowAddModal(false);
      loadProducts();
    } catch (error: any) {
      toast.error('Failed to save product', {
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProduct(deleteConfirm);
      toast.success('Product deleted successfully');
      setDeleteConfirm(null);
      loadProducts();
    } catch (error: any) {
      toast.error('Failed to delete product', {
        description: error.message,
      });
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
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Product Manager</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCsvUpload(true)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Bulk Upload (CSV)
                </Button>
                <Button onClick={handleOpenAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No products found. Create your first product!
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => {
                        const totalStock = Object.values(product.stock).reduce(
                          (sum, qty) => sum + qty,
                          0
                        );
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.season}</TableCell>
                            <TableCell>{totalStock}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditModal(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteConfirm(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />

        {/* Add/Edit Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => {
                      const newPrice = e.target.value;
                      setFormData({ ...formData, price: newPrice });
                      // Auto-calculate discount if original price exists
                      if (formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(newPrice || '0')) {
                        const discount = Math.round(((parseFloat(formData.originalPrice) - parseFloat(newPrice || '0')) / parseFloat(formData.originalPrice)) * 100);
                        setFormData(prev => ({ ...prev, discountPercentage: discount.toString() }));
                      }
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹) (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => {
                      const newOriginalPrice = e.target.value;
                      setFormData({ ...formData, originalPrice: newOriginalPrice });
                      // Auto-calculate discount percentage
                      if (newOriginalPrice && parseFloat(newOriginalPrice) > parseFloat(formData.price || '0')) {
                        const discount = Math.round(((parseFloat(newOriginalPrice) - parseFloat(formData.price || '0')) / parseFloat(newOriginalPrice)) * 100);
                        setFormData(prev => ({ ...prev, discountPercentage: discount.toString() }));
                      }
                    }}
                    placeholder="Leave empty if no discount"
                  />
                </div>
              </div>

              {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price || '0') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-muted-foreground">
                      {formData.discountPercentage && (
                        <span className="text-green-600 font-semibold">
                          {formData.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHighlighted"
                    checked={formData.isHighlighted}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isHighlighted: checked === true })
                    }
                  />
                  <Label htmlFor="isHighlighted" className="cursor-pointer">
                    Highlight as Popular Item
                  </Label>
                </div>
                <div>
                  <Label htmlFor="salesCount">Sales Count (Optional)</Label>
                  <Input
                    id="salesCount"
                    type="number"
                    min="0"
                    value={formData.salesCount}
                    onChange={(e) => setFormData({ ...formData, salesCount: e.target.value })}
                    placeholder="Auto-highlight if > 50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData({ ...formData, category: value });
                        setCustomCategory('');
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or enter category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">+ Add Custom Category</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.category === '__custom__' && (
                      <Input
                        placeholder="Enter custom category name"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setFormData({ ...formData, category: e.target.value });
                        }}
                        required
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="season">Season *</Label>
                  <Select
                    value={formData.season}
                    onValueChange={(value) => setFormData({ ...formData, season: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEASONS.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fabric">Fabric Variant (Optional)</Label>
                <Input
                  id="fabric"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  placeholder="e.g., Cotton, Polyester, Blend, 100% Cotton"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Specify the fabric/material type for this product
                </p>
              </div>

              <div>
                <Label>Sizes & Stock *</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {SIZES.map((size) => (
                    <div key={size} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={formData.sizes.includes(size)}
                          onCheckedChange={() => handleSizeToggle(size)}
                        />
                        <Label htmlFor={`size-${size}`} className="cursor-pointer">
                          {size}
                        </Label>
                      </div>
                      {formData.sizes.includes(size) && (
                        <Input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          value={formData.stock[size] || 0}
                          onChange={(e) => handleStockChange(size, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Product Images *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const files = Array.from(e.dataTransfer.files).filter((file) =>
                        file.type.startsWith('image/')
                      );
                      if (files.length > 0) {
                        handleImageSelect({ target: { files } } as any);
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images here, or click to select
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="cursor-pointer max-w-xs mx-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingProduct ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />

        {/* CSV Upload Modal */}
        <Dialog open={showCsvUpload} onOpenChange={setShowCsvUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Products (CSV)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>CSV File Format</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV should have columns: name, description, price, category, season, sizes (pipe-separated), stock (pipe-separated), images (pipe-separated URLs)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "Product Name","Description",999,"T-Shirts","Summer","S|M|L","10|20|15","url1|url2"
                </p>
              </div>
              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  disabled={uploading}
                  className="mt-2"
                />
              </div>
              {uploading && (
                <div className="text-center py-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">Uploading products...</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCsvUpload(false)} disabled={uploading}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductManager;
