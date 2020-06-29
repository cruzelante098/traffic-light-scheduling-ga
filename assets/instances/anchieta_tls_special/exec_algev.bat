"C:\Program Files\nodejs\node.exe" ^
--require ts-node/register ..\..\..\src\genetics.ts ^
 --project ..\..\..\tsconfig.json ^
 --network ..\anchieta_tls_special\anchieta.net.xml ^
 --routes ^
    ..\new_flow\flowrouterpy_routes.add.xml ^
    ..\new_flow\flowrouterpy_flow.add.xml ^
    ..\new_flow\bus.rou.xml ^
    ..\new_flow\heavy.rou.xml ^
    peatones_aleatorios.rou.xml ^
--save "C:\Users\Francisco Cruz\Repositorios\traffic-light-scheduling-ga\assets\instances\anchieta_tls_special\improved_anchieta.net.xml"