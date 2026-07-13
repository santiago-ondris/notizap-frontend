import * as XLSX from 'xlsx';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type {
  ProductoDetalle,
  RankingRotacion,
  RankingRotacionFiltros,
  RotacionAgregado
} from '@/types/evolucionStock/evolucionStockTypes';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';

export const exportRankingRotacion = async (filtros: RankingRotacionFiltros) => {
  const pageSize = 200;
  const primeraPagina = await evolucionStockService.obtenerRankingRotacion({
    ...filtros,
    page: 1,
    pageSize
  });

  const filas = [...primeraPagina.data];
  for (let page = 2; page <= primeraPagina.totalPaginas; page++) {
    const pagina = await evolucionStockService.obtenerRankingRotacion({
      ...filtros,
      page,
      pageSize
    });
    filas.push(...pagina.data);
  }

  const rows = filas.map(mapRankingRow);
  const workbook = XLSX.utils.book_new();
  const layouts: ReportSheetLayout[] = [];
  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Ranking',
    title: 'Ranking de rotacion',
    meta: [
      ['Generado', fechaDisplay(new Date())],
      ['Desde', filtros.desde ? fechaDisplay(filtros.desde) : 'Sin filtro'],
      ['Hasta', filtros.hasta ? fechaDisplay(filtros.hasta) : 'Sin filtro'],
      ['Marca', filtros.marca ?? 'Todas'],
      ['Proveedor', filtros.proveedor ?? 'Todos'],
      ['Total productos', filas.length]
    ],
    rows,
    columns: [
      ['Codigo', 12],
      ['Producto', 42],
      ['Marca', 22],
      ['Proveedor', 28],
      ['Primera compra registrada', 22],
      ['Comprado', 12],
      ['Vendido', 12],
      ['% vendido', 12],
      ['% vendido 7 dias', 16],
      ['% vendido 14 dias', 16],
      ['% vendido 30 dias', 16],
      ['No comparable por stock previo', 28]
    ]
  }));
  writeStyledWorkbook(workbook, `ranking-rotacion-${fechaArchivo()}.xlsx`, layouts);
};

export const exportDetalleProducto = (detalle: ProductoDetalle, periodo: { desde?: string; hasta?: string }) => {
  const workbook = XLSX.utils.book_new();
  const layouts: ReportSheetLayout[] = [];

  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Resumen',
    title: `Producto ${detalle.codigoProducto}`,
    meta: [
      ['Producto', detalle.nombreProducto],
      ['Generado', fechaDisplay(new Date())],
      ['Desde', periodo.desde ? fechaDisplay(periodo.desde) : 'Sin filtro'],
      ['Hasta', periodo.hasta ? fechaDisplay(periodo.hasta) : 'Sin filtro']
    ],
    rows: [
      { Metrica: 'Comprado', Valor: detalle.comprado },
      { Metrica: 'Vendido neto', Valor: detalle.vendido },
      { Metrica: 'Neto', Valor: detalle.neto },
      { Metrica: '% vendido', Valor: porcentaje(detalle.vendido, detalle.comprado) },
      { Metrica: 'Neto negativo', Valor: detalle.netoNegativo ? 'Si' : 'No' }
    ],
    columns: [['Metrica', 28], ['Valor', 24]]
  }));

  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Talles',
    title: 'Curva de talles',
    meta: [['Producto', `${detalle.codigoProducto} - ${detalle.nombreProducto}`]],
    rows: detalle.curvaTalles.map(row => ({
      Talle: row.talle,
      Comprado: row.comprado,
      Vendido: row.vendido,
      '% vendido': row.porcentajeVendido
    })),
    columns: [['Talle', 14], ['Comprado', 12], ['Vendido', 12], ['% vendido', 12]]
  }));

  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Colores',
    title: 'Desglose por color',
    meta: [['Producto', `${detalle.codigoProducto} - ${detalle.nombreProducto}`]],
    rows: detalle.desglosePorColor.map(row => ({
      Codigo: row.codigoColor,
      Color: row.nombreColor,
      Comprado: row.comprado,
      Vendido: row.vendido,
      Neto: row.neto,
      '% vendido': row.porcentajeVendido
    })),
    columns: [['Codigo', 10], ['Color', 30], ['Comprado', 12], ['Vendido', 12], ['Neto', 12], ['% vendido', 12]]
  }));

  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Sucursales',
    title: 'Desglose por sucursal',
    meta: [['Producto', `${detalle.codigoProducto} - ${detalle.nombreProducto}`]],
    rows: detalle.desglosePorSucursal.map(row => ({
      Sucursal: row.sucursal,
      Vendido: row.vendido,
      Devoluciones: row.devolucionesCliente,
      'Vendido neto': row.netoVendido
    })),
    columns: [['Sucursal', 24], ['Vendido', 12], ['Devoluciones', 14], ['Vendido neto', 14]]
  }));

  layouts.push(appendReportSheet(workbook, {
    sheetName: 'Serie temporal',
    title: 'Serie temporal',
    meta: [['Producto', `${detalle.codigoProducto} - ${detalle.nombreProducto}`]],
    rows: detalle.serieTemporal.map(row => ({
      Fecha: fechaDisplay(row.fecha),
      Tipo: tipoMovimientoLabel(row.tipo),
      Cantidad: row.cantidad,
      'Delta neto': row.netoDelta,
      'Neto acumulado': row.netoAcumulado
    })),
    columns: [['Fecha', 14], ['Tipo', 24], ['Cantidad', 12], ['Delta neto', 14], ['Neto acumulado', 16]]
  }));

  writeStyledWorkbook(workbook, `producto-${detalle.codigoProducto}-${fechaArchivo()}.xlsx`, layouts);
};

export const exportRotacionAgregada = (marcas: RotacionAgregado[], proveedores: RotacionAgregado[]) => {
  const workbook = XLSX.utils.book_new();
  const layouts = [
    appendRotacionSheet(workbook, 'Marcas', 'Rotacion por marca', marcas),
    appendRotacionSheet(workbook, 'Proveedores', 'Rotacion por proveedor', proveedores)
  ];
  writeStyledWorkbook(workbook, `rotacion-marca-proveedor-${fechaArchivo()}.xlsx`, layouts);
};

const mapRankingRow = (row: RankingRotacion) => ({
  Codigo: row.codigoProducto,
  Producto: row.nombreProducto,
  Marca: row.marca ?? '',
  Proveedor: row.proveedor ?? '',
  'Primera compra registrada': row.primeraCompraRegistrada,
  Comprado: row.unidadesCompradas,
  Vendido: row.unidadesVendidas,
  '% vendido': row.porcentajeVendido,
  '% vendido 7 dias': row.porcentajeVendido7Dias,
  '% vendido 14 dias': row.porcentajeVendido14Dias,
  '% vendido 30 dias': row.porcentajeVendido30Dias,
  'No comparable por stock previo': row.tieneNetoNegativo ? 'Si' : 'No'
});

export const porcentaje = (numerador: number, denominador: number) => {
  if (!denominador) return 0;
  return Math.round((numerador * 10000) / denominador) / 100;
};

const fechaArchivo = () => new Date().toISOString().slice(0, 10);

type ColumnSpec = [key: string, width: number];

interface ReportSheetConfig {
  sheetName: string;
  title: string;
  meta?: Array<[string, string | number]>;
  rows: Array<Record<string, string | number | boolean | null | undefined>>;
  columns: ColumnSpec[];
}

const appendRotacionSheet = (
  workbook: XLSX.WorkBook,
  sheetName: string,
  title: string,
  rows: RotacionAgregado[]
) => appendReportSheet(workbook, {
    sheetName,
    title,
    meta: [
      ['Generado', fechaDisplay(new Date())],
      ['Total filas', rows.length]
    ],
    rows: rows.map(row => ({
      Nombre: row.nombre,
      Comprado: row.unidadesCompradas,
      Vendido: row.unidadesVendidas,
      '% rotacion': row.porcentajeRotacion
    })),
    columns: [['Nombre', 34], ['Comprado', 12], ['Vendido', 12], ['% rotacion', 14]]
  });

interface ReportSheetLayout {
  tableHeaderRow: number;
  lastRow: number;
  columnCount: number;
}

const appendReportSheet = (workbook: XLSX.WorkBook, config: ReportSheetConfig): ReportSheetLayout => {
  const header = config.columns.map(([key]) => key);
  const table = [
    header,
    ...config.rows.map(row => header.map(key => row[key] ?? ''))
  ];
  const metaRows = config.meta ?? [];
  const sheetData = [
    [config.title],
    [],
    ...metaRows,
    [],
    ...table
  ];
  const tableStartRow = metaRows.length + 3;
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = config.columns.map(([, width]) => ({ wch: width }));
  worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(config.columns.length - 1, 1) } }];
  worksheet['!rows'] = sheetData.map((_, index) => ({ hpt: index === 0 ? 26 : index === tableStartRow ? 21 : 18 }));
  worksheet['!freeze'] = { xSplit: 0, ySplit: tableStartRow + 1 } as any;

  applyBasicStyles(worksheet, tableStartRow, config.columns.length, metaRows.length);
  XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);

  return {
    tableHeaderRow: tableStartRow + 1,
    lastRow: sheetData.length,
    columnCount: config.columns.length
  };
};

const applyBasicStyles = (
  worksheet: XLSX.WorkSheet,
  tableStartRow: number,
  columnCount: number,
  metaRowsLength: number
) => {
  const titleCell = worksheet['A1'];
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1A1A20' } }
    };
  }

  for (let row = 2; row < 2 + metaRowsLength; row++) {
    const label = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    const value = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
    if (label) {
      label.s = {
        font: { bold: true, color: { rgb: '394150' } },
        fill: { fgColor: { rgb: 'EEF2F7' } },
        border: reportBorder
      };
    }
    if (value) {
      value.s = {
        fill: { fgColor: { rgb: 'F8FAFC' } },
        border: reportBorder
      };
    }
  }

  for (let column = 0; column < columnCount; column++) {
    const cellAddress = XLSX.utils.encode_cell({ r: tableStartRow, c: column });
    const cell = worksheet[cellAddress];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '25636B' } },
        alignment: { horizontal: 'center' },
        border: reportBorder
      };
    }
  }
};

const reportBorder = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } }
};

const writeStyledWorkbook = (workbook: XLSX.WorkBook, fileName: string, layouts: ReportSheetLayout[]) => {
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  const files = unzipSync(new Uint8Array(buffer));
  files['xl/styles.xml'] = strToU8(reportStylesXml);

  Object.keys(files)
    .filter(path => /^xl\/worksheets\/sheet\d+\.xml$/.test(path))
    .forEach(path => {
      const sheetIndex = Number(path.match(/sheet(\d+)\.xml$/)?.[1] ?? '1') - 1;
      const xml = strFromU8(files[path]);
      files[path] = strToU8(applyReportXmlStyles(xml, layouts[sheetIndex]));
    });

  const styledWorkbook = zipSync(files, { level: 6 });
  const blob = new Blob([styledWorkbook], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const applyReportXmlStyles = (xml: string, layout?: ReportSheetLayout) =>
  xml.replace(/<c r="([A-Z]+)(\d+)"([^>]*)>/g, (_match, column: string, rowText: string, attrs: string) => {
    const row = Number(rowText);
    const styleId = getXmlStyleId(row, layout);
    const cleanedAttrs = attrs.replace(/\s+s="\d+"/, '');
    return `<c r="${column}${rowText}" s="${styleId}"${cleanedAttrs}>`;
  });

const getXmlStyleId = (row: number, layout?: ReportSheetLayout) => {
  if (row === 1) return 1;
  if (!layout) return row % 2 === 0 ? 5 : 4;
  if (row === layout.tableHeaderRow) return 3;
  if (row < layout.tableHeaderRow) return 2;
  return row % 2 === 0 ? 5 : 4;
};

const reportStylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FF334155"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F2937"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6F7"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF25636B"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF7FBFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleMedium9"/>
</styleSheet>`;

const fechaDisplay = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString('es-AR');
};

const tipoMovimientoLabel = (tipo: string | number) => {
  const value = String(tipo);
  if (value === '1' || value === 'Compra') return 'Compra';
  if (value === '2' || value === 'Venta') return 'Venta';
  if (value === '3' || value === 'DevolucionCliente') return 'Devolucion cliente';
  if (value === '4' || value === 'DevolucionProveedor') return 'Devolucion proveedor';
  return value;
};
