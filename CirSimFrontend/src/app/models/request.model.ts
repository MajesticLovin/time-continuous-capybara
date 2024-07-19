import { CircuitModel } from "./circuit.model";

export enum AnalysisType {
  DC = 'dc',
  AC = 'ac',
  TRANSIENT = 'transient',
}

export enum PySpiceBackend {
  NGSPICE_SHARED = 'ngspice-shared',
  NGSPICE_SUBPROCESS = 'ngspice-subprocess',
  XYCE_SERIAL = 'xyce-serial',
  XYCE_PARALLEL = 'xyce-parallel',
}

export enum AnalyzerType {
  PYSPICE = 'pyspice',
  AHKAB = 'ahkab',
}

export class AdditionalParams {
  id?: number;
  analysis_types: Record<AnalysisType, boolean>;
  pyspice_backend: PySpiceBackend;
  part_id: string;
  analyzer_type: AnalyzerType;
  pyspiceparams?: Record<string, any>;
  ahkadparams?: Record<string, any>;

  constructor(
    analyzer_type: AnalyzerType,
    analysis_types: Record<AnalysisType, boolean>,
    pyspice_backend: PySpiceBackend,
    id?: number | undefined,
    part_id: string = '',
    pyspiceparams?: Record<string, any>,
    ahkadparams?: Record<string, any>
  ) {
    this.id = id;
    this.analysis_types = analysis_types;
    this.pyspice_backend = pyspice_backend;
    this.part_id = part_id;
    this.analyzer_type = analyzer_type;
    this.pyspiceparams = pyspiceparams;
    this.ahkadparams = ahkadparams;
  }

  static fromDict(data: any): AdditionalParams {
    return new AdditionalParams(
      data.id,
      data.analysis_types,
      data.pyspice_backend,
      data.part_id,
      data.analyzer_type,
      data.pyspiceparams,
      data.ahkadparams
    );
  }

  toDict(): any {
    return {
      id: this.id,
      analysis_types: this.analysis_types,
      pyspice_backend: this.pyspice_backend,
      part_id: this.part_id,
      analyzer_type: this.analyzer_type,
      pyspiceparams: this.pyspiceparams,
      ahkadparams: this.ahkadparams,
    };
  }
}

export class RequestModel {
  circuit_id: string;
  circuit_name: string;
  circuit_data: CircuitModel;
  additional_params: AdditionalParams;

  constructor(
    circuit_id: string,
    circuit_name: string,
    circuit_data: CircuitModel,
    additional_params: AdditionalParams
  ) {
    this.circuit_id = circuit_id;
    this.circuit_name = circuit_name;
    this.circuit_data = circuit_data;
    this.additional_params = additional_params;
  }

  static toDict(request: RequestModel): any {
    return {
      circuit_id: request.circuit_id,
      circuit_name: request.circuit_name,
      circuit_data: request.circuit_data.toDict(),
      additional_params: request.additional_params.toDict(),
    };
  }

  static fromDict(data: any): RequestModel {
    return new RequestModel(
      data.circuit_id,
      data.circuit_name,
      CircuitModel.fromDict(data.circuit_data),
      AdditionalParams.fromDict(data.additional_params)
    );
  }
}
