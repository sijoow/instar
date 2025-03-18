
  // 전체 게시물 배열
  const allPosts = [];

  // 제외할 게시물 ID 배열 (원하는 게시물 ID를 추가하세요)
  const excludedIds = ['18051880924968246'];

  document.addEventListener('DOMContentLoaded', function(){
    const feedContainer = document.getElementById('instagramFeed');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');
    const closeBtn = modal.querySelector('.close-btn');

    // 실제 Instagram API 토큰 입력
    const token = '토큰추가';
    // 기본 한 페이지 요청 limit
    const pageLimit = 15;
    // 게시물 요청 URL (timestamp, id, caption 등 포함)
    let nextUrl = `https://graph.instagram.com/v22.0/me/media?access_token=${token}&fields=id,caption,media_url,permalink,media_type,timestamp&limit=${pageLimit}`;

    // 모달 닫기 함수
    function closeModal() {
      modal.style.display = 'none';
      modalContent.innerHTML = '';
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if(e.target === modal) closeModal();
    });

    // 게시물 정렬 후 렌더링 (최신순)
    function renderAllPosts() {
      allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      feedContainer.innerHTML = '';
      allPosts.forEach((item, idx) => {
        feedContainer.appendChild(createFeedItem(item, idx));
      });
    }

    // 각 게시물 DOM 생성
    function createFeedItem(item, index) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'instagram_item';

      // 미디어 삽입
      if(item.media_type === 'VIDEO'){
        const video = document.createElement('video');
        video.src = item.media_url;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        itemDiv.appendChild(video);
      } else if(item.media_type === 'IMAGE'){
        const img = document.createElement('img');
        img.src = item.media_url;
        itemDiv.appendChild(img);
      } else if(item.media_type === 'CAROUSEL_ALBUM' && item.children) {
        // 첫 번째 미디어만 미리보기
        const first = item.children[0];
        if(first) {
          if(first.media_type === 'VIDEO'){
            const video = document.createElement('video');
            video.src = first.media_url;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            itemDiv.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = first.media_url;
            itemDiv.appendChild(img);
          }
        }
        // 여러 장 아이콘
        if(item.children.length > 1) {
          const icon = document.createElement('div');
          icon.className = 'multi-icon';
          icon.innerHTML = `<i class="fa-solid fa-layer-group" style="font-size:14px;margin-top:5px;"></i>`;
          itemDiv.appendChild(icon);
        }
      }

      // 텍스트(캡션) 추가
      if(item.caption) {
        const captionEl = document.createElement('p');
        captionEl.className = 'caption';
        // 줄바꿈(\n) 기준으로 각 문단을 <p> 태그로 감싸고, 앞뒤를 <div>로 감싸줍니다.
        const splitted = item.caption.split(/\n/).map(para => `<p style="text-align:left;">${para}</p>`).join('');
        captionEl.innerHTML = `<div>${splitted}</div>`;
        itemDiv.appendChild(captionEl);
      }

      console.log("게시물 ID:", item.id);

      // 게시물 클릭 시 전체 게시물 모달 슬라이더 열기
      itemDiv.addEventListener('click', function(e){
        e.preventDefault();
        openModalAllPosts(index);
      });

      return itemDiv;
    }

    // 모달에 전체 게시물을 Swiper 슬라이더로 보여주는 함수
    function openModalAllPosts(initialIndex) {
      // 메인 슬라이더 구조
      modalContent.innerHTML = `
        <div class="swiper-container all-posts-swiper">
          <div class="swiper-wrapper"></div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>
      `;
      const mainWrapper = modalContent.querySelector('.swiper-wrapper');

      // 전체 게시물을 슬라이드로 추가
      allPosts.forEach(post => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'swiper-slide';

        // 여러 이미지 (nested-swiper)
        if(post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length > 1) {
          slideDiv.innerHTML = `
            <div class="swiper-container nested-swiper">
              <div class="swiper-wrapper"></div>
              <div class="p_n_button_wrapper">
                <div class="swiper-pagination custom-pagination"></div>
                <div class="swiper-button-next_instar_2"><i class="fa-solid fa-angle-right"></i></div>
                <div class="swiper-button-prev_instar_2"><i class="fa-solid fa-chevron-left"></i></div>
              </div>
            </div>
          `;
          const nestedWrapper = slideDiv.querySelector('.nested-swiper .swiper-wrapper');
          post.children.forEach(child => {
            const nestedSlide = document.createElement('div');
            nestedSlide.className = 'swiper-slide';
            if(child.media_type === 'VIDEO'){
              const video = document.createElement('video');
              video.src = child.media_url;
              video.autoplay = true;
              video.loop = true;
              video.muted = true;
              video.playsInline = true;
              nestedSlide.appendChild(video);
            } else {
              const img = document.createElement('img');
              img.src = child.media_url;
              nestedSlide.appendChild(img);
            }
            nestedWrapper.appendChild(nestedSlide);
          });

          // caption 추가 (nested swiper에도)
          if(post.caption) {
            const captionEl = document.createElement('div');
            captionEl.className = 'slide-caption';
            // 여기도 <div> 태그로 감싸기
            const splitted = post.caption.split(/\n/).map(para => `<p>${para}</p>`).join('');
            captionEl.innerHTML = `
			<div class="senter-section">
			<span class="logo_button">
			<img src="/web/img/icon/new2/main_logo_off.png" style="max-width:32px;margin-top:10px;" alt=""/> </span>
			<span class="tab_logo">yogibokorea</span>
			</div>
			<div style="width:100%;height:15px;"></div>	
			<div>${splitted}</div>`;
            slideDiv.appendChild(captionEl);
          }

        } else {
          // 단일 이미지/영상
          if(post.caption) {
            // 이미지+캡션 50:50 레이아웃
            const container = document.createElement('div');
            container.className = 'slide-content';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'slide-image';
            if(post.media_type === 'VIDEO'){
              const video = document.createElement('video');
              video.src = post.media_url;
              video.autoplay = true;
              video.loop = true;
              video.muted = true;
              video.playsInline = true;
              imageContainer.appendChild(video);
            } else {
              const img = document.createElement('img');
              if(post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length === 1) {
                img.src = post.children[0].media_url;
              } else {
                img.src = post.media_url;
              }
              imageContainer.appendChild(img);
            }

            const captionContainer = document.createElement('div');
            captionContainer.className = 'slide-caption';
            // 캡션도 <div>로 감싸기
            const splitted = post.caption.split(/\n/).map(para => `<p>${para}</p>`).join('');
            captionContainer.innerHTML = `<div>
			<div class="senter-section">
			<span class="logo_button">
			<img src="/web/img/icon/new2/main_logo_off.png" style="max-width:32px;margin-top:10px;" alt=""/> </span>
			<span class="tab_logo">yogibokorea</span>
			</div>
			<div style="width:100%;height:15px;"></div>
    
			${splitted}</div>`;

            container.appendChild(imageContainer);
            container.appendChild(captionContainer);
            slideDiv.appendChild(container);
          } else {
            // 캡션이 없는 경우
            if(post.media_type === 'VIDEO'){
              const video = document.createElement('video');
              video.src = post.media_url;
              video.autoplay = true;
              video.loop = true;
              video.muted = true;
              video.playsInline = true;
              slideDiv.appendChild(video);
            } else {
              const img = document.createElement('img');
              if(post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length === 1) {
                img.src = post.children[0].media_url;
              } else {
                img.src = post.media_url;
              }
              slideDiv.appendChild(img);
            }
          }
        }
        mainWrapper.appendChild(slideDiv);
      });

      // nested-swiper 초기화
      const nestedSwipers = modalContent.querySelectorAll('.nested-swiper');
      nestedSwipers.forEach(nested => {
        new Swiper(nested, {
          loop: true,
          pagination: {
            el: nested.querySelector('.swiper-pagination'),
            type: 'custom',
            clickable: true,
            renderCustom: function (swiper, current, total) {
              return current + ' / ' + total;
            },
          },
          navigation: {
            nextEl: nested.querySelector('.swiper-button-next_instar_2'),
            prevEl: nested.querySelector('.swiper-button-prev_instar_2'),
          },
        });
      });

      // 전체 게시물용 Swiper 초기화
      new Swiper('.all-posts-swiper', {
        initialSlide: initialIndex,
        loop: false,
        navigation: {
          nextEl: '.all-posts-swiper .swiper-button-next',
          prevEl: '.all-posts-swiper .swiper-button-prev',
        },
      });

      modal.style.display = 'flex';
    }

    // 추가로 필요한 게시물만큼 불러오는 함수
    async function loadExtraPosts(extraLimit) {
      if(!nextUrl) return;
      const extraUrlObj = new URL(nextUrl);
      extraUrlObj.searchParams.set('limit', extraLimit);
      const extraUrl = extraUrlObj.toString();

      try {
        const response = await axios.get(extraUrl);
        if(response.data.paging && response.data.paging.next) {
          nextUrl = response.data.paging.next;
          loadMoreBtn.style.display = 'block';
        } else {
          nextUrl = null;
          loadMoreBtn.style.display = 'none';
        }
        
        const data = response.data.data;
        const itemPromises = data.map(async (item) => {
          if(item.media_type === 'CAROUSEL_ALBUM'){
            const childRes = await axios.get(
              `https://graph.instagram.com/${item.id}?access_token=${token}&fields=children{media_url,media_type,timestamp}`
            );
            item.children = childRes.data.children.data;
          }
          return item;
        });
        const resolvedItems = await Promise.all(itemPromises);
        const filteredItems = resolvedItems.filter(item => !excludedIds.includes(item.id));
        allPosts.push(...filteredItems);
      } catch(err) {
        console.error('Error loading extra posts:', err);
      }
    }

    // 인스타그램 API 호출 (한 페이지 단위)
    async function loadInstagramData(url) {
      try {
        const response = await axios.get(url);
        if(response.data.paging && response.data.paging.next) {
          nextUrl = response.data.paging.next;
          loadMoreBtn.style.display = 'block';
        } else {
          nextUrl = null;
          loadMoreBtn.style.display = 'none';
        }
        
        const data = response.data.data;
        const itemPromises = data.map(async (item) => {
          if(item.media_type === 'CAROUSEL_ALBUM'){
            const childRes = await axios.get(
              `https://graph.instagram.com/${item.id}?access_token=${token}&fields=children{media_url,media_type,timestamp}`
            );
            item.children = childRes.data.children.data;
          }
          return item;
        });
        const resolvedItems = await Promise.all(itemPromises);
        // 필터링: 제외할 게시물 ID 제거
        const filteredItems = resolvedItems.filter(item => !excludedIds.includes(item.id));
        allPosts.push(...filteredItems);

        // 부족할 경우 추가 로드
        const extraNeeded = pageLimit - filteredItems.length;
        if(extraNeeded > 0 && nextUrl) {
          await loadExtraPosts(extraNeeded);
        }
        
        renderAllPosts();
      } catch(err) {
        console.error('Error fetching data:', err);
      }
    }

    // 초기 로드
    loadInstagramData(nextUrl);

    // 더보기 버튼 클릭 시
    loadMoreBtn.addEventListener('click', function(){
      if(nextUrl) loadInstagramData(nextUrl);
    });
  });

