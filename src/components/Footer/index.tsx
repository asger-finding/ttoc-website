import Tank from '../Tank';
import {
  TANK_ICON_SIZES
} from '../../constants';

export default function Footer(props: {}) {
    return <div className="Footer">
        <div className="Footer-Tanks">
            <p style={{ gridArea: 'creator' }}>Created by</p>
            <div style={{ gridArea: 'creatorTank' }}>
                <Tank playerId="29725" size={TANK_ICON_SIZES.Large} outline="false"></Tank>
            </div>
            <p style={{ gridArea: 'developer' }}>Sponsored by the TankTrouble scientists</p>
            <div style={{ gridArea: 'developerTank', display: 'flex' }}>
                <Tank playerId="1145079" size={TANK_ICON_SIZES.Large} outline="false"></Tank>
                <Tank playerId="160470" size={TANK_ICON_SIZES.Large} outline="false"></Tank>
            </div>
        </div>
        <div className="Footer-Navigation">
            <p><a href="https://tanktrouble.com">Visit TankTrouble</a></p>
            <p><a href="https://github.com/asger-finding/ttoc-website">Website Source</a></p>
            <p><a href="mailto:contact@ttoc.ca">Contact Us!</a></p>
            <br></br>
            TTOC: Powering competitive TankTrouble since 2016
        </div>
    </div>
}
