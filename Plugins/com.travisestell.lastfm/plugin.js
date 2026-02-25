/// <reference path="../../Documentation/tapestry.d.ts" />

function verify() {
    const verification = {
        displayName: `Loved Tracks from ${user}'s Friends on Last.fm`
    };
    processVerification(verification);
}

function load() {
    let url = `https://taestell-cloud-worker.taestell.workers.dev/tapestry/lastfm/${user}/friends`;
    console.log(`Fetching loved tracks from friends for user ${user} from Last.fm: ${url}`);

    sendRequest(url, "GET").then(text => {
        const jsonObject = JSON.parse(text);
        const lovedTracks = jsonObject.lovedTracks || [];

        let items = [];

        // Convert fetchedItems to Tapestry Item objects
        for (const lovedTrack of lovedTracks) {
            const item = Item.createWithUriDate(`${lovedTrack.url}?loved_by=${lovedTrack.actor.name}`, new Date(lovedTrack.date.uts * 1000));
            item.body = `&#8220;<a href="${lovedTrack.url}">${lovedTrack.name}</a>&#8221; by <a href="${lovedTrack.artist.url}">${lovedTrack.artist.name}</a>`;
            const identity = Identity.createWithName(lovedTrack.actor.realname);
            if (lovedTrack.actor.name != lovedTrack.actor.realname) {
                identity.username = lovedTrack.actor.name;
            }
            if (lovedTrack.actor.avatar) {
                identity.avatar = lovedTrack.actor.avatar;
            }
            identity.uri = `https://www.last.fm/user/${lovedTrack.actor.name}`;
            item.author = identity;
            const annotation = Annotation.createWithText(`Loved Track`);
            item.annotations = [annotation];

            // add item to feed
            items.push(item);
        }
        processResults(items);

    });

}
