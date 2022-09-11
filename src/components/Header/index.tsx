export default function Header(props: {}) {
    return <div className="Header">
        <img
            className="Header-Logo"
            style={{ gridArea: 'headerLogo' }}
            src={process.env.PUBLIC_URL + '/header/ttoc-header.png'}
            srcSet={`${ process.env.PUBLIC_URL }/header/ttoc-header@2x.png 2x, ${process.env.PUBLIC_URL}/header/ttoc-header@4x.png 4x`}
            width={250}
            height={250}
            alt="TTOC Header"
        ></img>
        <h1 className="Header-Title" style={{ gridArea: 'headerTitle' }}>TankTrouble Online Competition</h1>
        <h2 className="Header-Subtitle" style={{ gridArea: 'headerSubtitle' }}>TankTrouble's largest competition for over { new Date().getFullYear() - 2016 } years</h2>
    </div>
}
