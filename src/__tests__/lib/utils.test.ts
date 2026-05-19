import { cn } from '@/lib/utils';

describe('Utility Functions - Unit Tests', () => {
  describe('cn (Tailwind Merge)', () => {
    it('should correctly merge tailwind classes and override conflicts', () => {
      // Arrange
      const class1 = 'px-2 py-2';
      const class2 = 'px-4';

      // Act
      const result = cn(class1, class2);

      // Assert
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).not.toContain('px-2');
    });

    it('should handle conditional classes properly', () => {
      // Arrange
      const baseClass = 'base';
      const isActive = true;
      const isDisabled = false;

      // Act
      const result = cn(baseClass, isActive && 'is-active', isDisabled && 'is-disabled');

      // Assert
      expect(result).toContain('base');
      expect(result).toContain('is-active');
      expect(result).not.toContain('is-disabled');
    });

    it('should handle undefined and null inputs without crashing', () => {
      // Arrange
      const inputs = ['base', undefined, null, false, 'extra'];

      // Act
      const result = cn(...inputs);

      // Assert
      expect(result).toBe('base extra');
    });
  });

  describe('compressAndResizeImage', () => {
    let originalImage: typeof global.Image;
    let createElementSpy: jest.SpyInstance;

    beforeEach(() => {
      // Backup globals
      originalImage = global.Image;

      // Mock canvas
      const mockContext = {
        drawImage: jest.fn(),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue(mockContext),
        toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,mocked_base64_string'),
      } as unknown as HTMLCanvasElement;

      createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas;
        return document.createElement(tagName);
      });
    });

    afterEach(() => {
      global.Image = originalImage;
      jest.restoreAllMocks();
    });

    it('should compress and resize a large image correctly', async () => {
      // Mock the Image constructor to simulate successful image loading
      class MockImage {
        private _src = '';
        width = 1600;
        height = 1200;
        onload: () => void = () => {};
        onerror: () => void = () => {};

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          setTimeout(() => this.onload(), 0);
        }
      }

      (global as any).Image = MockImage;

      const { compressAndResizeImage } = await import('@/lib/utils');

      const result = await compressAndResizeImage('data:image/png;base64,largeimage', 800, 800);

      // Because width (1600) > height (1200) and > maxWidth (800)
      // New width should be 800, new height should be 1200 * (800 / 1600) = 600
      expect(createElementSpy).toHaveBeenCalledWith('canvas');
      expect(result).toBe('data:image/jpeg;base64,mocked_base64_string');
    });

    it('should handle image loading errors gracefully', async () => {
      class MockErrorImage {
        private _src = '';
        width = 0;
        height = 0;
        onload: () => void = () => {};
        onerror: () => void = () => {};

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          setTimeout(() => this.onerror(), 0);
        }
      }

      (global as any).Image = MockErrorImage;

      const { compressAndResizeImage } = await import('@/lib/utils');

      await expect(compressAndResizeImage('invalid_data', 800, 800)).rejects.toThrow(
        'Falha ao carregar a imagem para compressão',
      );
    });

    it('should compress and resize a tall vertical image correctly', async () => {
      class MockTallImage {
        private _src = '';
        width = 1200;
        height = 1600;
        onload: () => void = () => {};
        onerror: () => void = () => {};

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          setTimeout(() => this.onload(), 0);
        }
      }

      (global as any).Image = MockTallImage;

      const { compressAndResizeImage } = await import('@/lib/utils');

      const result = await compressAndResizeImage('data:image/png;base64,tallimage', 800, 800);

      expect(createElementSpy).toHaveBeenCalledWith('canvas');
      expect(result).toBe('data:image/jpeg;base64,mocked_base64_string');
    });
  });
});
