// import { Button } from '@/components/ui/button';
// import { Table } from '@tanstack/react-table';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// interface DataTablePaginationProps {
//   table: Table<any>;
// }

// const TablePagination = ({ table }: DataTablePaginationProps) => {
//   const currentPage = table.getState().pagination.pageIndex;
//   const totalPages = table.getPageCount();
  
//   const renderPageNumbers = () => {
//     const pages = [];
    
//     if (totalPages <= 7) {
//       // Show all pages if total is 7 or less
//       for (let i = 0; i < totalPages; i++) {
//         pages.push(
//           <Button
//             key={`page-${i}`}
//             onClick={() => table.setPageIndex(i)}
//             size="icon"
//             className={`w-8 h-8 hover:text-primary-foreground ${
//               currentPage === i ? 'bg-default' : 'bg-default-300 text-default'
//             }`}
//           >
//             {i + 1}
//           </Button>
//         );
//       }
//     } else {
//       // Always show first page
//       pages.push(
//         <Button
//           key="page-0"
//           onClick={() => table.setPageIndex(0)}
//           size="icon"
//           className={`w-8 h-8 hover:text-primary-foreground ${
//             currentPage === 0 ? 'bg-default' : 'bg-default-300 text-default'
//           }`}
//         >
//           1
//         </Button>
//       );

//       if (currentPage <= 3) {
//         // Show pages 2, 3, 4 if we're near the beginning
//         for (let i = 1; i <= Math.min(3, totalPages - 2); i++) {
//           pages.push(
//             <Button
//               key={`page-${i}`}
//               onClick={() => table.setPageIndex(i)}
//               size="icon"
//               className={`w-8 h-8 hover:text-primary-foreground ${
//                 currentPage === i ? 'bg-default' : 'bg-default-300 text-default'
//               }`}
//             >
//               {i + 1}
//             </Button>
//           );
//         }
        
//         // Add dots if there's a gap
//         if (totalPages > 5) {
//           pages.push(
//             <span key="dots-end" className="px-2 text-default-500">
//               ...
//             </span>
//           );
//         }
//       } else if (currentPage >= totalPages - 4) {
//         // Add dots at the beginning
//         pages.push(
//           <span key="dots-start" className="px-2 text-default-500">
//             ...
//           </span>
//         );
        
//         // Show last few pages if we're near the end
//         for (let i = Math.max(totalPages - 4, 1); i < totalPages - 1; i++) {
//           pages.push(
//             <Button
//               key={`page-${i}`}
//               onClick={() => table.setPageIndex(i)}
//               size="icon"
//               className={`w-8 h-8 hover:text-primary-foreground ${
//                 currentPage === i ? 'bg-default' : 'bg-default-300 text-default'
//               }`}
//             >
//               {i + 1}
//             </Button>
//           );
//         }
//       } else {
//         // We're in the middle - show dots, current page area, dots
//         pages.push(
//           <span key="dots-start" className="px-2 text-default-500">
//             ...
//           </span>
//         );
        
//         // Show current page and adjacent pages
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pages.push(
//             <Button
//               key={`page-${i}`}
//               onClick={() => table.setPageIndex(i)}
//               size="icon"
//               className={`w-8 h-8 hover:text-primary-foreground ${
//                 currentPage === i ? 'bg-default' : 'bg-default-300 text-default'
//               }`}
//             >
//               {i + 1}
//             </Button>
//           );
//         }
        
//         pages.push(
//           <span key="dots-end" className="px-2 text-default-500">
//             ...
//           </span>
//         );
//       }

//       // Always show last page (if it's not already shown)
//       if (totalPages > 1) {
//         pages.push(
//           <Button
//             key={`page-${totalPages - 1}`}
//             onClick={() => table.setPageIndex(totalPages - 1)}
//             size="icon"
//             className={`w-8 h-8 hover:text-primary-foreground ${
//               currentPage === totalPages - 1 ? 'bg-default' : 'bg-default-300 text-default'
//             }`}
//           >
//             {totalPages}
//           </Button>
//         );
//       }
//     }
    
//     return pages;
//   };

//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-center p-4 gap-4">
//       <div className="flex items-center justify-center gap-1 md:gap-2 flex-none">
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() => table.previousPage()}
//           disabled={!table.getCanPreviousPage()}
//           className="w-8 h-8"
//         >
//           <ChevronLeft className={`w-4 h-4 ${document?.dir === 'rtl' ? 'rotate-180' : ''}`} />
//         </Button>
        
//         {renderPageNumbers()}
        
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() => table.nextPage()}
//           disabled={!table.getCanNextPage()}
//           className="w-8 h-8"
//         >
//           <ChevronRight className={`w-4 h-4 ${document?.dir === 'rtl' ? 'rotate-180' : ''}`} />
//         </Button>
//       </div>
      
//       {/* Optional: Show current page info */}
//       <div className="text-sm text-muted-foreground">
//         Page {currentPage + 1} of {totalPages}
//       </div>
//     </div>
//   );
// };

// export default TablePagination;