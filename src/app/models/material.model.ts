export interface Material {
  id: number;
  material: string;
  descripcion: string;
  almacen: string;
  lote: string;
  cantidad: number;
  conteo: number;
  reconteo: number;
  fecReg: string;
  obs: string;
  local: string;
  umb: string;
  parihuela: string;
  ubicacion: string;
  fec: string;
  cta: string;
  usuario: string;
  fecSys: string;
  estado: string;
}

export interface MaterialesResponse {
  consultaId: string;
  materiales: Material[];
}