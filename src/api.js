// Load options
var options = {
  accessToken: null,
};
if (typeof chrome.storage !== 'undefined') {
  chrome.storage.sync.get(null, function(items) {
    options = items;
  });
}

var BASE_URL = 'https://api.vk.com/method/';
var API_VERSION = 5.53;

var objectToParam = function(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += key + '=' + encodeURIComponent(obj[key]);
  }

  return str;
};

var apiCall = function(method, params) {
  params = params || {};
  params.v = API_VERSION;
  var accessToken = options.accessToken;
  params.access_token = accessToken;

  return new Promise(function(resolve, reject) {
    return fetch(BASE_URL + method + '?' + objectToParam(params))
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      // TODO: handle errors
      resolve(json.response);
    })
    .catch(reject);
  });
};

var createVkManagerAlbum = function() {
  return apiCall('photos.createAlbum', {title: 'VkManager'})
    .then(function(response) {
      return response.id;
    });
};

var getVkManagerAlbumId = function() {
  return apiCall('photos.getAlbums')
    .then(function(response) {
      var filteredAlbums = response.items.filter(function(album) {
        if (album.title.toLowerCase() === 'vkmanager') {
          return album;
        } else {
          return false;
        }
      });

      if (filteredAlbums.length > 0) {
        return filteredAlbums[0].id;
      } else {
        return createVkManagerAlbum();
      }
    });
};

var getUploadServer = function(albumId) {
  return apiCall('photos.getUploadServer', {album_id: albumId})
    .then(function(response) {
      return response.upload_url;
    });
};

var vkManagerApi = {
  getCurrentUser: function() {
    return new Promise(function(resolve, reject) {
      apiCall('users.get')
        .then(function(response) {
          if (typeof response[0] === 'undefined') {
            reject('INVALID_RESPONSE');
          }

          var user = response[0];

          resolve(user);
        })
        .catch(reject);
    });
  },
  uploadImage: function(image) {
    return new Promise(function(resolve, reject) {
      getVkManagerAlbumId()
        .then(function(albumId) {
          return getUploadServer(albumId);
        })
        .then(function(uploadUrl) {
          var formData = new FormData;
          formData.append('file1', image, 'file.jpg');

          return fetch(uploadUrl, {
            method: 'POST',
            body: formData
          });
        })
        .then(function(response) {
          console.log(response);
        })
        .catch(reject);
    });
  }
};

if (window) {
  window.vkManagerApi = vkManagerApi;
} else if (global) {
  global.vkManagerApi = vkManagerApi;
}
