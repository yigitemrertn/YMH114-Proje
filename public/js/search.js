document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInputs = [
        document.getElementById('search-input'),
        document.getElementById('search-input-mobile')
    ].filter(Boolean);

    // Helper: Get/Set search history in localStorage by type
    function getSearchHistory(type) {
        try {
            return JSON.parse(localStorage.getItem('search_history_' + type)) || [];
        } catch {
            return [];
        }
    }
    function setSearchHistory(type, arr) {
        // En fazla 10 tane tut
        localStorage.setItem('search_history_' + type, JSON.stringify(arr.slice(0, 10)));
    }

    function createDropdownMenu(query, onTypeSelect, onHistorySelect, onHistoryDelete) {
        const types = [
            { type: 'users', label: `“${query}” kullanıcılar arasında ara` },
            { type: 'posts', label: `“${query}” gönderiler arasında ara` },
            { type: 'comments', label: `“${query}” yorumlar arasında ara` }
        ];
        const container = document.createElement('div');
        container.className = 'search-type-dropdown';

        // Önceki aramalar (global, unique)
        const allHistory = ['users', 'posts', 'comments']
            .map(getSearchHistory)
            .flat()
            .filter((v, i, arr) => arr.indexOf(v) === i);

        let filteredHistory;
        if (query) {
            filteredHistory = allHistory.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));
        } else {
            filteredHistory = allHistory;
        }

        // Sadece karakter girildiyse arama seçeneklerini göster
        if (query) {
            types.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'search-type-option';
                btn.type = 'button';
                btn.textContent = opt.label;
                btn.onclick = (e) => {
                    e.preventDefault();
                    doSearch(query, opt.type);
                    closeDropdown();
                };
                container.appendChild(btn);
            });
        }

        if (filteredHistory.length > 0) {
            const historyWrap = document.createElement('div');
            historyWrap.className = 'search-history-wrap';
            const hLabel = document.createElement('div');
            hLabel.className = 'search-history-label';
            hLabel.textContent = 'Önceki Aramalar';
            historyWrap.appendChild(hLabel);
            // Sadece son 5 aramayı göster
            filteredHistory.slice(0, 5).forEach(h => {
                const hBtnWrap = document.createElement('div');
                hBtnWrap.style.display = 'flex';
                hBtnWrap.style.alignItems = 'center';
                hBtnWrap.style.justifyContent = 'space-between';
                hBtnWrap.style.paddingRight = '8px';

                const hBtn = document.createElement('button');
                hBtn.className = 'search-history-item';
                hBtn.type = 'button';
                hBtn.textContent = h;
                hBtn.style.flex = '1 1 auto';
                hBtn.style.overflow = 'hidden';
                hBtn.style.textOverflow = 'ellipsis';
                hBtn.onclick = (e) => {
                    e.preventDefault();
                    onHistorySelect(h);
                };

                const delBtn = document.createElement('button');
                delBtn.type = 'button';
                delBtn.className = 'search-history-delete';
                delBtn.title = 'Sil';
                delBtn.innerHTML = '<i class="fas fa-times"></i>';
                delBtn.style.background = 'none';
                delBtn.style.border = 'none';
                delBtn.style.color = '#888';
                delBtn.style.cursor = 'pointer';
                delBtn.style.marginLeft = '4px';
                delBtn.style.fontSize = '1.1em';
                delBtn.style.width = '28px';
                delBtn.style.height = '28px';
                delBtn.style.display = 'flex';
                delBtn.style.alignItems = 'center';
                delBtn.style.justifyContent = 'center';
                delBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHistoryDelete(h);
                };

                hBtnWrap.appendChild(hBtn);
                hBtnWrap.appendChild(delBtn);
                historyWrap.appendChild(hBtnWrap);
            });
            container.appendChild(historyWrap);
        }
        return container;
    }

    function attachDropdown(input) {
        let dropdownMenu = null;
        let lastQuery = '';

        // Disable browser autocomplete
        input.setAttribute('autocomplete', 'off');

        function ensureDropdown(query) {
            if (!dropdownMenu) {
                openDropdown(query);
            } else {
                updateDropdown(query);
            }
        }

        function openDropdown(query) {
            closeDropdown();
            const parent = input.closest('.search-container') || input.parentElement;
            dropdownMenu = createDropdownMenu(query, handleTypeSelect, handleHistorySelect, handleHistoryDelete);
            dropdownMenu.classList.add('search-type-dropdown-anim', 'show');
            parent.appendChild(dropdownMenu);
        }

        function updateDropdown(query) {
            if (!dropdownMenu) return openDropdown(query);
            const parent = input.closest('.search-container') || input.parentElement;
            const newDropdown = createDropdownMenu(query, handleTypeSelect, handleHistorySelect, handleHistoryDelete);
            newDropdown.classList.add('search-type-dropdown-anim', 'show');
            parent.replaceChild(newDropdown, dropdownMenu);
            dropdownMenu = newDropdown;
        }

        function closeDropdown() {
            if (dropdownMenu && dropdownMenu.parentNode) {
                dropdownMenu.parentNode.removeChild(dropdownMenu);
                dropdownMenu = null;
            }
        }

        function handleTypeSelect(type) {
            doSearch(input.value, type);
            closeDropdown();
        }

        function handleHistorySelect(hQuery) {
            input.value = hQuery;
            lastQuery = hQuery;
            ensureDropdown(hQuery);
        }

        function handleHistoryDelete(hQuery) {
            // Tüm tiplerden sil
            ['users', 'posts', 'comments'].forEach(t => {
                let history = getSearchHistory(t);
                history = history.filter(item => item !== hQuery);
                setSearchHistory(t, history);
            });
            // Dropdown'u güncelle
            ensureDropdown(input.value);
        }

        input.addEventListener('focus', () => {
            lastQuery = input.value;
            ensureDropdown(lastQuery);
        });
        input.addEventListener('input', () => {
            lastQuery = input.value;
            ensureDropdown(lastQuery);
        });
        document.addEventListener('mousedown', function(e) {
            if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== input) {
                closeDropdown();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && input.value) {
                doSearch(input.value, 'posts');
                closeDropdown();
            }
        });

        const searchButton = input.parentElement.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', function(e) {
                e.preventDefault();
                const query = input.value.trim();
                if (!query) return;
                doSearch(query, 'posts');
                closeDropdown();
            });
        }
    }

    // Bu fonksiyonun global olması için window'a ekle
    window.doSearch = doSearch;

    function doSearch(query, type) {
        if (!query || !type) return;
        // Her arama yapılan kelimeyi, tüm tiplerin geçmişine ekle (tekrarsız, en başa)
        ['users', 'posts', 'comments'].forEach(t => {
            let history = getSearchHistory(t);
            history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
            history.unshift(query);
            setSearchHistory(t, history);
        });
        // Yönlendirmeyi doğrudan yap (fetch ile bekleme)
        if (type === 'users') {
            window.location.href = `/public/search-users.html?q=${encodeURIComponent(query)}`;
        } else if (type === 'posts') {
            window.location.href = `/public/search-posts.html?q=${encodeURIComponent(query)}`;
        } else if (type === 'comments') {
            window.location.href = `/public/search-comments.html?q=${encodeURIComponent(query)}`;
        }
    }

    // Style for dropdown (animasyonlu ve modern)
    if (!document.getElementById('search-type-dropdown-style')) {
        const style = document.createElement('style');
        style.id = 'search-type-dropdown-style';
        style.innerHTML = `
        .search-type-dropdown {
            position: absolute;
            left: 0; right: 0; top: 110%;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            z-index: 10000;
            padding: 0.5rem 0;
            min-width: 220px;
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
            pointer-events: none;
            transition: all 0.22s cubic-bezier(.4,1.3,.6,1);
        }
        .search-type-dropdown.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        .search-type-option, .search-history-item {
            display: block;
            width: 100%;
            background: none;
            border: none;
            text-align: left;
            padding: 0.7rem 1.2rem;
            font-size: 1rem;
            color: #222;
            cursor: pointer;
            transition: background 0.18s;
        }
        .search-type-option:hover, .search-history-item:hover {
            background: #f0f7ff;
        }
        .search-history-wrap {
            border-top: 1px solid #eee;
            margin-top: 0.3rem;
            padding-top: 0.3rem;
        }
        .search-history-label {
            font-size: 0.85rem;
            color: #888;
            margin: 0.2rem 1.2rem 0.1rem 1.2rem;
        }
        @media (max-width: 768px) {
            .search-type-dropdown {
                left: 5vw; right: 5vw;
            }
        }
        `;
        document.head.appendChild(style);
    }

    // Attach to all search inputs in nav
    searchInputs.forEach(input => {
        const parent = input.closest('.search-container');
        if (parent) {
            parent.style.position = 'relative';
            attachDropdown(input);
        }
    });

    // Test: Konsola dropdown'ın yüklendiğini yaz
    console.log('search.js loaded, dropdown logic attached:', searchInputs.length);

    // Mobile search dropdown aç/kapat
    const searchButtonMobile = document.querySelector('.search-button-mobile');
    const searchDropdown = document.querySelector('.search-dropdown');
    if (searchButtonMobile && searchDropdown) {
        searchButtonMobile.addEventListener('click', function(e) {
            e.stopPropagation();
            searchDropdown.classList.toggle('active');
            if (searchDropdown.classList.contains('active')) {
                const mobileInput = document.getElementById('search-input-mobile');
                if (mobileInput) mobileInput.focus();
            }
        });
        document.addEventListener('click', function(event) {
            if (!searchButtonMobile.contains(event.target) && !searchDropdown.contains(event.target)) {
                searchDropdown.classList.remove('active');
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                searchDropdown.classList.remove('active');
            }
        });
    }
});