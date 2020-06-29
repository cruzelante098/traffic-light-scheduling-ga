"C:\Program Files\nodejs\node.exe" ^
--require ts-node/register ..\..\..\src\genetics.ts ^
 --project ..\..\..\tsconfig.json ^
 --network ..\anchieta_tls_algev-interior_lane_changes\anchieta.net.xml ^
 --routes ^
    ..\new_flow\flowrouterpy_routes.add.xml ^
    ..\new_flow\flowrouterpy_flow.add.xml ^
    ..\new_flow\bus.rou.xml ^
    ..\new_flow\heavy.rou.xml ^
--save "C:\Users\Francisco Cruz\Repositorios\traffic-light-scheduling-ga\assets\instances\anchieta_tls_algev-interior_lane_changes\improved_anchieta.net.xml"