'use client';

import React, { useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define the type for our data
type Person = {
  id: number;
  [key: string]: string | number;
};

// Generate a large dataset with many columns
const generateData = (rowCount: number, columnCount: number): Person[] => {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const person: Person = { id: rowIndex + 1 };
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      person[`field${colIndex}`] = `Value ${rowIndex}-${colIndex}`;
    }
    return person;
  });
};

// Generate column definitions
const generateColumns = (count: number): ColumnDef<Person>[] => {
  return Array.from({ length: count }, (_, index) => ({
    accessorFn: (row) => row[`field${index}`],
    id: `field${index}`,
    header: `Column ${index + 1}`,
    size: 150,
  }));
};

// Sample data (1000 rows, 50 columns)
const defaultData: Person[] = generateData(1000, 50);
const defaultColumns: ColumnDef<Person>[] = generateColumns(50);

// Main component
export default function Tab7({ height }: { height: number }) {
  const [data] = useState<Person[]>(() => [...defaultData]);
  const [columns] = useState<ColumnDef<Person>[]>(() => [...defaultColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });

  const { rows } = table.getRowModel();

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // Approximate row height
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Approximate column width
    overscan: 2,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();

  const totalRowHeight = rowVirtualizer.getTotalSize();
  const totalColumnWidth = columnVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalRowHeight - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div
      ref={parentRef}
      // className="h-[500px] max-w-[800px] overflow-auto"
      className="max-w-[800px] overflow-auto bg-blue-200"
      style={{ height: `${(660 * height) / 100}px` }}
    >
      <Table>
        <TableHeader>
          <TableRow
            style={{
              height: '35px',
              width: `${totalColumnWidth}px`,
            }}
          >
            <TableHead style={{ width: '150px' }}>ID</TableHead>
            {virtualColumns.map((virtualColumn) => {
              const header = table.getHeaderGroups()[0].headers[virtualColumn.index];
              return (
                <TableHead
                  key={header.id}
                  style={{
                    width: `${virtualColumn.size}px`,
                    transform: `translateX(${virtualColumn.start}px)`,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <TableRow>
              <TableCell style={{ height: `${paddingTop}px` }} />
            </TableRow>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                data-index={virtualRow.index}
                data-state={row.getIsSelected() && 'selected'}
              >
                <TableCell style={{ width: '150px' }}>{row.original.id}</TableCell>
                {virtualColumns.map((virtualColumn) => {
                  const cell = row.getVisibleCells()[virtualColumn.index];
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${virtualColumn.size}px`,
                        transform: `translateX(${virtualColumn.start}px)`,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <TableRow>
              <TableCell style={{ height: `${paddingBottom}px` }} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
