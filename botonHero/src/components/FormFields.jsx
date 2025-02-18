import React from 'react';

const FormFields = ({
  selectedBank,
  handleSelectChange,
  bankOptions,
  selectedNacionalidad,
  handleSelectChangeNacionalidad,
  nacionalidad,
  cedula,
  handleChangeCedula,
  selectedCodigoArea,
  handleSelectChangeCodigoArea,
  codigosArea,
  telefono,
  handleChangeTelefono,
  monto,
  handleChangeMonto
}) => {
  return (
    <>
      <label htmlFor="bank" className="block">
        <select 
          value={selectedBank} 
          onChange={handleSelectChange} 
          className="text-lg bg-white pl-1 pr-1 w-56 mt-0 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove" 
          id="bank"
        >
          <option value="" disabled className='text-center'>Seleccione el Banco</option>
          {bankOptions.map((bank) => (
            <option key={bank.codigo_banco} value={bank.codigo_banco}>
              {`${bank.codigo_banco} - ${bank.nombre_banco}`}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
        <div className="relative flex-1 flex items-center">
          <label htmlFor="nacionalidad" className="block">
            <select 
              value={selectedNacionalidad} 
              onChange={handleSelectChangeNacionalidad}
              className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove" 
              id="nacionalidad"
            >
              <option value="" disabled className='text-center'>N/J</option>
              {nacionalidad.map((nacio, index) => (
                <option key={index} value={nacio} className='text-center'>{nacio}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="relative flex-1 flex items-center">
          <input 
            id="cedula" 
            type="number"
            value={cedula}
            placeholder="Cédula/RIF."
            onChange={handleChangeCedula}
            onInput={(e) => {
              const maxLength = selectedNacionalidad === 'J' ? 9 : 8;
              e.target.value = e.target.value.slice(0, maxLength);
            }}
            className="text-lg w-36 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" 
          />
          <label 
            htmlFor="cedula" 
            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
          >
            Cédula/RIF.
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-row pl-1 pr-1 gap-1">
        <div className="relative flex-1 flex items-center">
          <label htmlFor="codigosArea" className="block">
            <select
              value={selectedCodigoArea}
              onChange={handleSelectChangeCodigoArea}
              className="text-lg bg-white pl-1 pr-1 w-20 px-0.5 border-0 border-b-1 border-azulMove focus:ring-0 focus:border-naranjaMove"
              id="codigosArea"
            >
              <option value="" className="text-center">04**</option>
              {codigosArea.map((codigoArea, index) => (
                <option key={index} value={codigoArea} className="text-center">
                  {codigoArea}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="relative flex-1 flex items-center">
          <input
            id="telefono"
            type="number"
            value={telefono}
            placeholder="Teléfono"
            onChange={handleChangeTelefono}
            onInput={(e) => {
              e.target.value = e.target.value.slice(0, 7);
            }}
            className="text-lg w-36 peer border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove"
          />
          <label
            htmlFor="telefono"
            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-0 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
          >
            Teléfono
          </label>
        </div>
      </div>

      <div className="mt-8 relative flex flex-row pl-1 pr-1">
        <input 
          id="monto" 
          type="text"
          value={`Bs.${monto}`}
          onChange={handleChangeMonto}
          readOnly 
          className="w-56 peer h-10 border-b-1 border-azulMove text-gray-900 placeholder-transparent focus:outline-none focus:border-naranjaMove" 
        />
        <label 
          htmlFor="monto" 
          className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
        >
          Monto
        </label>
      </div>
    </>
  );
};

export default FormFields;
