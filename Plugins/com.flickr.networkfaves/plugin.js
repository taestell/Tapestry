/// <reference path="../../Documentation/tapestry.d.ts" />

function verify() {

    sendRequest(`https://taestell-cloud-worker.taestell.workers.dev/tapestry/flickr/${user}/faves?validate=true`).then(text => {
        const jsonObject = JSON.parse(text);
        if (jsonObject.user && typeof jsonObject.user.username === 'string' && jsonObject.user.username.trim() !== '') {
            const verification = {
                displayName: `Faves from ${jsonObject.user.username}'s Network on Flickr`,
                icon: jsonObject.user.avatar
            };
            processVerification(verification);
        }
    });

}

function load() {
    let url = `https://taestell-cloud-worker.taestell.workers.dev/tapestry/flickr/${user}/network-faves`;

    sendRequest(url).then(text => {
        const jsonObject = JSON.parse(text);
        const fetchedItems = jsonObject["items"];
        setItem(MIN_FAVE_DATE, jsonObject["newestFaveDate"]);

        let items = [];

        // Convert fetchedItems to Tapestry Item objects
        for (const fetched of fetchedItems) {
            const item = Item.createWithUriDate(fetched.uri, new Date(fetched.date));
            if (typeof fetched.title === 'string' && fetched.title.trim() !== '') {
                item.title = fetched.title;
            }
            if (typeof fetched.body === 'string' && fetched.body.trim() !== '') {
                item.body = fetched.body;
            }
            if (fetched.author) {
                const author = Identity.createWithName(fetched.author.name);
                if (fetched.author.username != fetched.author.name) {
                    author.username = fetched.author.username;
                }
                author.uri = fetched.author.uri;
                author.avatar = fetched.author.avatar;
                item.author = author;
            }
            if (Array.isArray(fetched.attachments)) {
                item.attachments = fetched.attachments.map(att => {
                    // Only handle MediaAttachment for Flickr faves
                    const media = MediaAttachment.createWithUrl(att.url);
                    if (att.aspectSize && typeof att.aspectSize.width === 'number' && typeof att.aspectSize.height === 'number') {
                        media.aspectSize = {
                            width: att.aspectSize.width,
                            height: att.aspectSize.height
                        };
                    }
                    return media;
                });
            }
            /*if (Array.isArray(fetched.annotations)) {
                item.annotations = fetched.annotations.map(ann => {
                    return Annotation.createWithText(ann.text);
                });
            }*/
            // add feed user as annotation
            if (jsonObject.user && typeof jsonObject.user.username === 'string' && jsonObject.user.username.trim() !== '') {
                const annotation = Annotation.createWithText(`Faved by ${jsonObject.user.username} on Flickr`);
                annotation.uri = jsonObject.user.uri;
                annotation.icon = jsonObject.user.avatar;
                item.annotations = allFeedItemsAnnotation;
            }
            // add item to feed
            items.push(item);
        }

        processResults(items);

    });

}