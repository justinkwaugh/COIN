import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceCitadel from 'fallingsky/actions/placeCitadel'

describe("Place Citadel", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
    });

    it('places aedui citadel in aedui region', function () {
        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        const aeduiTribe = state.tribesById[TribeIDs.AEDUI];
        expect(aeduiRegion.getAlliesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        PlaceAlliedTribe.run(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.AEDUI,
            tribeId: TribeIDs.AEDUI
        });
        expect(aeduiRegion.getAlliesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        expect(aeduiTribe.alliedFactionId()).to.equal(FactionIDs.AEDUI);
        PlaceCitadel.run(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.AEDUI,
            tribeId: TribeIDs.AEDUI
        });
        aeduiRegion.logState();
        expect(aeduiRegion.getAlliesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(aeduiRegion.getCitadelForFaction(FactionIDs.AEDUI)).to.not.be.null;
        expect(aeduiTribe.isCitadel()).to.equal(true);
    });


});