import json

def analizar_geojson(ruta_archivo):  # ✅ Cambiado a parámetro correcto
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=== ESTRUCTURA GEOJSON ===")
    print(f"Tipo: {data['type']}")
    print(f"Número de features: {len(data['features'])}")
    
    # Analizar propiedades
    propiedades = set()
    tipos_geometria = set()
    
    for feature in data['features']:
        if 'properties' in feature:
            propiedades.update(feature['properties'].keys())
        if 'geometry' in feature:
            tipos_geometria.add(feature['geometry']['type'])
    
    print(f"\nPropiedades encontradas: {sorted(propiedades)}")
    print(f"Tipos de geometría: {tipos_geometria}")
    
    # Ejemplo del primer feature
    if data['features']:
        primer_feature = data['features'][0]
        print(f"\nEjemplo de propiedades del primer feature:")
        for key, value in primer_feature.get('properties', {}).items():
            print(f"  {key}: {type(value).__name__} = {value}")

# ✅ FORMA CORRECTA DE USARLO:
# Opción 1: Raw string (recomendado)
analizar_geojson(r"C:\Users\santi\Desktop\Proyecto DSS\BackendConnective+\ConnectiveBackend-1\src\main\resources\static\col_departments_simplified.geojson")

# Opción 2: Dobles backslashes
# analizar_geojson("C:\\Users\\santi\\Desktop\\Proyecto DSS\\BackendConnective+\\ConnectiveBackend-1\\src\\main\\resources\\static\\col_departments_simplified.geojson")

# Opción 3: Forward slashes (también funciona en Windows)
# analizar_geojson("C:/Users/santi/Desktop/Proyecto DSS/BackendConnective+/ConnectiveBackend-1/src/main/resources/static/col_departments_simplified.geojson")