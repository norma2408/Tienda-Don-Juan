// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from './models/product.interface';
import { ProductService } from './services/product.service';
import { CartService, Cart } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tienda don res';
  productos: Product[] = [];
  carrito: Cart | null = null;
  loading = true;
  error = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.suscribirseAlCarrito();
  }

  // Cargar productos desde el backend
  cargarProductos(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (productos) => {
        if (productos.length === 0) {
          // Si no hay productos, crear los iniciales
          this.productService.seedProducts().subscribe({
            next: (productosCreados) => {
              this.productos = productosCreados;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error al crear productos:', err);
              this.error = 'Error al cargar productos';
              this.loading = false;
            }
          });
        } else {
          this.productos = productos;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  // Suscribirse a cambios del carrito
  suscribirseAlCarrito(): void {
    this.cartService.cart$.subscribe(
      cart => this.carrito = cart
    );
  }

  // Agregar producto al carrito
  agregarAlCarrito(producto: Product): void {
    if (producto._id) {
      this.cartService.addToCart(producto._id, 1).subscribe({
        next: () => {
          console.log('Producto agregado al carrito');
        },
        error: (err) => {
          console.error('Error al agregar al carrito:', err);
          alert('Error al agregar el producto al carrito');
        }
      });
    }
  }

  // Incrementar cantidad de un producto
  incrementarCantidad(productoId: string, cantidadActual: number): void {
    this.cartService.updateCartItem(productoId, cantidadActual + 1).subscribe({
      error: (err) => console.error('Error al actualizar:', err)
    });
  }

  // Decrementar cantidad de un producto
  decrementarCantidad(productoId: string, cantidadActual: number): void {
    if (cantidadActual > 1) {
      this.cartService.updateCartItem(productoId, cantidadActual - 1).subscribe({
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.eliminarProductoCompleto(productoId);
    }
  }

  // Eliminar producto del carrito
  eliminarProductoCompleto(productoId: string): void {
    this.cartService.removeFromCart(productoId).subscribe({
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  // Vaciar el carrito
  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito super wow?')) {
      this.cartService.clearCart().subscribe({
        next: () => console.log('Carrititito vaciado'),
        error: (err) => console.error('Error al vaciar:', err)
      });
    }
  }

  // Verificar si el carrito está vacío
  carritoVacio(): boolean {
    return !this.carrito || this.carrito.items.length === 0;
  }

  // Obtener items del carrito
  obtenerItemsCarrito(): any[] {
    return this.carrito?.items || [];
  }

  // Calcular total
  calcularTotal(): number {
    return this.carrito?.total || 0;
  }

  // Obtener cantidad total de productos
  cantidadTotalProductos(): number {
    if (!this.carrito) return 0;
    return this.carrito.items.reduce((total, item) => total + item.cantidad, 0);
  }
}